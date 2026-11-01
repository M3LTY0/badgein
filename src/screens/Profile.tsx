import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CERTIFICATIONS, SKILLS } from "../lib/options";
import { parseResume, ResumeError, type ParsedResume } from "../lib/resumeParser";
import { useProfile } from "../ProfileContext";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="block rounded-lg border border-line px-2 py-1.5">
      <span className="block text-[8px] text-slate-400">{label}</span>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-transparent text-[10.5px] text-white outline-none placeholder:text-slate-500";

function MultiSelect({ values, onChange, placeholder, options }: {
  values: string[]; onChange: (v: string[]) => void; placeholder: string; options: string[];
}) {
  const remaining = options.filter((o) => !values.includes(o));
  return (
    <>
      <span className="relative block">
        <select
          value=""
          onChange={(e) => e.target.value && onChange([...values, e.target.value])}
          className={`${inputCls} cursor-pointer appearance-none py-0.5 pl-1 pr-5 [&>option]:text-black`}
        >
          <option value="">{placeholder}</option>
          {remaining.map((o) => <option key={o}>{o}</option>)}
        </select>
        <svg className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-white" width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {values.length > 0 && (
        <ul className="mt-1.5 flex flex-wrap gap-1">
          {values.map((v) => (
            <li key={v} className="flex items-center gap-1 rounded-full bg-chip py-0.5 pl-2 pr-1 text-[8.5px] font-medium text-brand">
              {v}
              <button
                type="button"
                aria-label={`Remove ${v}`}
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="flex h-3 w-3 items-center justify-center rounded-full text-[10px] leading-none hover:bg-line"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { profile, update } = useProfile();
  const { name, program, skills, certs, resume, linkedin, share } = profile;
  const setShare = (patch: Partial<typeof share>) => update({ share: { ...share, ...patch } });
  const setName = (v: string) => update({ name: v });
  const setProgram = (v: string) => update({ program: v });
  const setSkills = (v: string[]) => update({ skills: v });
  const setCerts = (v: string[]) => update({ certs: v });
  const [reading, setReading] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  /** Merge what the parser found into the profile. Skills/certs are added to, never removed from. */
  const applyParsed = (p: ParsedResume, fileName: string, source: "ai" | "local") => {
    const newSkills = p.skills.filter((s) => !skills.includes(s));
    const newCerts = p.certs.filter((c) => !certs.includes(c));
    update({
      resume: fileName,
      ...(p.name && { name: p.name }),
      ...(p.program && { program: p.program }),
      ...(p.linkedin && { linkedin: p.linkedin }),
      skills: [...skills, ...newSkills],
      certs: [...certs, ...newCerts],
    });
    const filled = [p.name && "name", p.program && "program", p.linkedin && "LinkedIn"].filter(Boolean) as string[];
    const added = [newSkills.length && plural(newSkills.length, "skill"), newCerts.length && plural(newCerts.length, "certification")].filter(Boolean);
    const found = [...(filled.length ? [`filled in ${filled.join(", ")}`] : []), ...(added.length ? [`added ${added.join(" and ")}`] : [])];
    setNotice({
      kind: "ok",
      text: found.length
        ? `Read your resume (${source === "ai" ? "with AI" : "keyword match"}): ${found.join("; ")}. Check it looks right.`
        : "Resume uploaded, but nothing could be filled in automatically. Add your details below.",
    });
  };

  const onResumeChosen = async (file: File | undefined) => {
    if (!file) return;
    setReading(true);
    setNotice(null);
    try {
      const { data, source } = await parseResume(file);
      applyParsed(data, file.name, source);
    } catch (err) {
      setNotice({ kind: "error", text: err instanceof ResumeError ? err.message : "Something went wrong reading that file." });
    } finally {
      setReading(false);
    }
  };

  return (
    <form
      className="flex flex-1 flex-col"
      // TODO(logic): validate fields and save the profile to a backend, and generate the badge ID, before navigating.
      onSubmit={(e) => { e.preventDefault(); navigate("/badge"); }}
    >
      <Link to="/" className="self-start text-[9.5px] text-slate-300 hover:text-white">‹ Back</Link>
      <h2 className="mt-2.5 text-[14px] font-extrabold">Your profile</h2>

      <div className="mb-3 mt-3 flex flex-col gap-2.5">
        {/* Upload comes first: a good resume fills in most of the fields below. */}
        <label className={`flex items-center justify-center gap-1 rounded-lg border-2 border-dashed border-brand px-2 py-2.5 text-[9px] text-white ${reading ? "cursor-wait opacity-70" : "cursor-pointer"}`}>
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="sr-only"
            disabled={reading}
            aria-label="Upload resume (PDF)"
            // TODO(backend): upload the PDF to storage so employers can open it; today only the file name is kept.
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = ""; // allow picking the same file again
              void onResumeChosen(file);
            }}
          />
          {reading ? (
            <span className="text-brand">Reading your resume…</span>
          ) : resume ? (
            <>
              <span className="truncate">{resume}</span>
              <span className="whitespace-nowrap text-brand">✓ Uploaded · replace</span>
            </>
          ) : (
            <span className="text-brand">Upload resume (PDF) to auto-fill</span>
          )}
        </label>
        {notice && (
          <p role="status" className={`-mt-1 text-[8.5px] leading-snug ${notice.kind === "error" ? "text-red-400" : "text-slate-300"}`}>
            {notice.text}
          </p>
        )}

        <Field label="Name">
          <input aria-label="Name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Program">
          <input aria-label="Program" className={inputCls} value={program} onChange={(e) => setProgram(e.target.value)} />
        </Field>
        <Field label="Skills">
          <MultiSelect values={skills} onChange={setSkills} placeholder="Select a skill…" options={SKILLS} />
        </Field>
        <Field label="Certifications">
          <MultiSelect values={certs} onChange={setCerts} placeholder="Select a certification…" options={CERTIFICATIONS} />
        </Field>

        <Field label="LinkedIn profile">
          <input
            aria-label="LinkedIn profile"
            className={inputCls}
            value={linkedin}
            placeholder="linkedin.com/in/your-name"
            onChange={(e) => update({ linkedin: e.target.value })}
          />
        </Field>

        <Field label="Employers who scan your badge can see">
          <p className="mt-0.5 text-[9.5px] text-slate-300">Name, program and skills</p>
          <div className="mt-1.5 flex flex-col gap-1">
            {([
              ["resume", "Resume"],
              ["certs", "Certifications"],
              ["linkedin", "LinkedIn"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-1.5 text-[9.5px] text-white">
                <input
                  type="checkbox"
                  checked={share[key]}
                  onChange={(e) => setShare({ [key]: e.target.checked })}
                  className="h-3 w-3 accent-brand"
                />
                {label}
              </label>
            ))}
          </div>
        </Field>

      </div>

      <button
        type="submit"
        className="mt-auto w-full rounded-lg bg-brand py-2.5 text-[11px] font-bold text-white transition hover:brightness-110"
      >
        Get my badge
      </button>
    </form>
  );
}
