import { CERTIFICATIONS, SKILLS } from "./options";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

/** Fields we can pull out of a resume. Everything is optional: only what was actually found. */
export type ParsedResume = {
  name?: string;
  program?: string;
  linkedin?: string;
  skills: string[];
  certs: string[];
};
export type ParseOutcome = { data: ParsedResume; source: "ai" | "local" };

/** Thrown for problems the user can act on (wrong file, scanned PDF...). The message is shown as-is. */
export class ResumeError extends Error {}

const MAX_BYTES = 10 * 1024 * 1024;
// AI parsing is switched off for now (see the commented-out block near the bottom of this file).
// To turn it back on, uncomment these two lines, the "AI parsing" block, and the marked lines in parseResume().
// const AI_URL: string = import.meta.env.VITE_RESUME_API ?? "/api/parse-resume";
// const AI_TIMEOUT_MS = 25_000;

/* ---------------------------------------------------------------- PDF -> text */

/** Reads the text layer of a PDF in the browser. The file itself never leaves the device here. */
export async function extractPdfText(file: File): Promise<string> {
  // Loaded on demand so the PDF engine isn't part of the first page load.
  const [{ getDocument, GlobalWorkerOptions }, worker] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    
  ]);
  GlobalWorkerOptions.workerSrc = worker.default;

  const task = getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  try {
    const pdf = await task.promise;
    const pages: string[] = [];
    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
      const content = await (await pdf.getPage(i)).getTextContent();
      let out = "";
      for (const item of content.items) {
        if ("str" in item) out += item.str + (item.hasEOL ? "\n" : " ");
      }
      pages.push(out);
    }
    return pages.join("\n");
  } finally {
    void task.destroy();
  }
}

/* ------------------------------------------------------- local (no AI) matching */

// Each entry: the exact value from options.ts, and patterns that mean the resume has it.
const SKILL_PATTERNS: Record<string, RegExp[]> = {
  JavaScript: [/\bjavascript\b/, /\becmascript\b/],
  Python: [/\bpython\b/],
  Java: [/\bjava\b/],
  "C#": [/c#/, /\bc-sharp\b/, /\bcsharp\b/],
  SQL: [/\bsql\b/, /\bmysql\b/, /\bpostgres(ql)?\b/, /\bsqlite\b/],
  "HTML/CSS": [/\bhtml5?\b/, /\bcss3?\b/],
  React: [/\breact(\.?js)?\b/],
  "UX Design": [/\bux\b/, /\bui\/ux\b/, /\buser experience\b/],
  "Data Analysis": [
    /\bdata analy(sis|st|tics)\b/,
    /\bpower ?bi\b/,
    /\btableau\b/,
  ],
  "Cloud (AWS/Azure)": [
    /\baws\b/,
    /\bazure\b/,
    /\bamazon web services\b/,
    /\bgoogle cloud\b/,
    /\bgcp\b/,
  ],
  "Project Management": [
    /\bproject manage(ment|r)\b/,
    /\bproject coordinat/,
    /\bscrum\b/,
  ],
  Communication: [/\bcommunicat(ion|ions|e|ing)\b/],
  Teamwork: [/\bteam ?work\b/, /\bteam player\b/, /\bcollaborat/],
};

const CERT_PATTERNS: Record<string, RegExp[]> = {
  "AWS Certified Cloud Practitioner": [
    /aws certified cloud practitioner/,
    /\bclf-c0\d\b/,
  ],
  "Microsoft Azure Fundamentals (AZ-900)": [
    /\baz-?900\b/,
    /azure fundamentals/,
  ],
  "CompTIA Security+": [/security\+/, /comptia security/],
  "Google Cloud Digital Leader": [/google cloud digital leader/],
  "Oracle Certified Java Programmer": [
    /oracle certified (java )?(programmer|associate|professional)/,
  ],
  "Certified Scrum Master (CSM)": [/certified scrum master/, /\bcsm\b/],
  "Meta Front-End Developer": [/meta front[- ]?end developer/],
  "Cisco CCNA": [/\bccna\b/],
};

// A cert mentioned on a line like this is one the person does NOT hold yet, so it must not land on their badge.
const NOT_HELD =
  /\b(studying|study(ing)? for|preparing|prepar(ation|ing)|in progress|working (toward|towards)|pursuing|planned|planning|expected|will (write|take)|aiming)\b/i;

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Whole-word match that also works for labels ending in symbols, like "C#" or "Security+". */
const wordRe = (s: string) =>
  new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(s)}(?![\\p{L}\\p{N}])`, "u");

/**
 * Keywords for one dropdown entry. The entry's own text is always a keyword, so a skill added to the dropdown
 * (options.ts) is searched for with no extra work. Entries without hand-written patterns also get keywords pulled
 * from their label: "Cloud (AWS/Azure)" -> cloud, aws, azure; "HTML/CSS" -> html, css.
 */
function patternsFor(option: string, hand?: RegExp[]): RegExp[] {
  const label = option.toLowerCase();
  const found = [wordRe(label), ...(hand ?? [])];
  if (!hand) {
    const bare = label.replace(/\(.*?\)/g, " ");
    const inParens = [...label.matchAll(/\((.*?)\)/g)].map((m) => m[1]);
    const tokens = [
      bare,
      ...bare.split("/"),
      ...inParens,
      ...inParens.flatMap((p) => p.split(/[/,&]/)),
    ]
      .map((t) => t.trim())
      .filter((t) => t.length >= 2);
    found.push(...tokens.map(wordRe));
  }
  return found;
}

/** Options whose keywords appear in `text`. With `skip`, occurrences on a line matching `skip` don't count. */
function matchList(
  text: string,
  patterns: Record<string, RegExp[]>,
  options: string[],
  skip?: RegExp,
) {
  return options.filter((o) =>
    patternsFor(o, patterns[o]).some((re) => {
      for (const m of text.matchAll(
        new RegExp(
          re.source,
          re.flags.includes("g") ? re.flags : re.flags + "g",
        ),
      )) {
        if (!skip) return true;
        const start = text.lastIndexOf("\n", m.index) + 1;
        const end = text.indexOf("\n", m.index);
        if (!skip.test(text.slice(start, end === -1 ? undefined : end)))
          return true;
      }
      return false;
    }),
  );
}

const titleCase = (s: string) =>
  s.toLowerCase().replace(/(^|[\s'-])\p{L}/gu, (m) => m.toUpperCase());

/** First short line that looks like a person's name ("Jane Q. Doe", "JANE DOE"). */
function findName(lines: string[]): string | undefined {
  for (const line of lines.slice(0, 6)) {
    if (/\d|@|https?:|\bresume\b|\bcurriculum\b|\bvitae\b|\bcv\b/i.test(line))
      continue;
    const words = line.split(/\s+/);
    if (words.length < 2 || words.length > 4) continue;
    if (!words.every((w) => /^\p{Lu}[\p{L}.'’-]*$/u.test(w))) continue;
    return words.every((w) => w === w.toUpperCase()) ? titleCase(line) : line;
  }
  return undefined;
}

const LINKEDIN_RE =
  /(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[A-Za-z0-9_%-]+\/?/i;
const PROGRAM_RE =
  /\b(advanced diploma|diploma|bachelor|b\.?\s?sc|associate degree|degree|certificate in)\b/i;

/** First education-looking line, with dates stripped. Best effort: the user can edit it afterwards. */
function findProgram(lines: string[]): string | undefined {
  const line = lines.find((l) => PROGRAM_RE.test(l) && l.length <= 120);
  if (!line) return undefined;
  const cleaned = line
    .replace(/[•·▪●■]/g, " ")
    .replace(/\(?\b(19|20)\d{2}\b.*$/, "")
    .replace(/[\s,–—-]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length >= 4 ? cleaned.slice(0, 80) : undefined;
}

/** Keyword matching against our own lists. Works offline and keeps the resume on the device. */
export function localExtract(text: string): ParsedResume {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const lower = text.toLowerCase();
  const linkedin = text.match(LINKEDIN_RE)?.[0];
  return {
    name: findName(lines),
    program: findProgram(lines),
    linkedin: linkedin
      ? linkedin.startsWith("http")
        ? linkedin
        : `https://${linkedin}`
      : undefined,
    skills: matchList(lower, SKILL_PATTERNS, SKILLS),
    certs: matchList(lower, CERT_PATTERNS, CERTIFICATIONS, NOT_HELD),
  };
}

/* -------------------------------------------- AI parsing (currently disabled) */
// Sends the resume text to /api/parse-resume (server/parse-resume.mjs) and sanitises the answer.
// Needs the server running (npm run api) and a paid Anthropic API key. Uncomment to re-enable.
//

// const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);
// const onlyKnown = (v: unknown, options: string[]) =>
//   Array.isArray(v) ? options.filter((o) => v.includes(o)) : [];

// /** Treat the server's answer as untrusted: keep only strings of sensible length and values from our lists. */
// export function sanitizeParsed(raw: unknown): ParsedResume {
//   const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
//   return {
//     name: str(o.name, 80),
//     program: str(o.program, 80),
//     linkedin: str(o.linkedin, 200),
//     skills: onlyKnown(o.skills, SKILLS),
//     certs: onlyKnown(o.certs, CERTIFICATIONS),
//   };
// }

// async function aiExtract(text: string): Promise<ParsedResume | null> {
//   if (AI_URL === "off") return null;
//   const ctrl = new AbortController();
//   const timer = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS);
//   try {
//     const res = await fetch(AI_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       // The server only picks from these lists, so they stay defined in one place (options.ts).
//       body: JSON.stringify({ text: text.slice(0, 30_000), skills: SKILLS, certs: CERTIFICATIONS }),
//       signal: ctrl.signal,
//     });
//     // A static host may answer with its index.html (status 200) when there is no API: that is "no AI available".
//     if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) return null;
//     return sanitizeParsed(await res.json());
//   } catch {
//     return null;
//   } finally {
//     clearTimeout(timer);
//   }
// }

/* ----------------------------------------------------------------- entry point */

/** Upload -> text -> fields, using keyword matching against the skill and certification lists. */
export async function parseResume(file: File): Promise<ParseOutcome> {
  if (
    file.type !== "application/pdf" &&
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    throw new ResumeError("Please upload a PDF.");
  }
  if (file.size > MAX_BYTES)
    throw new ResumeError("That PDF is over 10 MB. Try a smaller file.");

  let text: string;
  try {
    text = await extractPdfText(file);
  } catch {
    throw new ResumeError(
      "Couldn't open that PDF. It may be damaged or password-protected.",
    );
  }
  if (text.replace(/\s/g, "").length < 40) {
    throw new ResumeError(
      "No readable text in that PDF (it may be a scan). Fill in your details by hand.",
    );
  }

  // AI parsing disabled for now. To re-enable, uncomment the next two lines and delete the final return.
  // const ai = await aiExtract(text);
  // return ai ? { data: ai, source: "ai" } : { data: localExtract(text), source: "local" };
  return { data: localExtract(text), source: "local" };
}
