import type { ProfileData } from "../ProfileContext";

/** What an employer sees after scanning a badge. Only fields the attendee chose to share are filled. */
export type SharedProfile = {
  id: string;
  name: string;
  program: string;
  skills: string[];
  certs: string[];
  resume: string;
  linkedin: string;
};

// TODO(backend): today the badge link carries the profile itself (base64 in the URL hash), so scanning works
// with no server. Once there is an API, encode only `${origin}/p/<id>` and fetch the profile by id instead.
// That also makes the QR much smaller and lets the attendee change what is shared after printing a badge.

const MAX_TEXT = 200;
const MAX_ITEMS = 30;

const toB64 = (s: string) => {
  let bin = "";
  new TextEncoder().encode(s).forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromB64 = (s: string) => {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

/** Accept "linkedin.com/in/x" or a full URL. Anything that isn't http(s) is dropped (blocks javascript: links). */
export function normalizeLinkedin(raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withScheme);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : "";
  } catch {
    return "";
  }
}

/** Apply the attendee's sharing toggles to their profile. */
export function buildShared(p: ProfileData): SharedProfile {
  return {
    id: p.id,
    name: p.name,
    program: p.program,
    skills: p.skills,
    certs: p.share.certs ? p.certs : [],
    resume: p.share.resume ? p.resume : "",
    linkedin: p.share.linkedin ? normalizeLinkedin(p.linkedin) : "",
  };
}

/** The hash payload (compact keys keep the QR code less dense). */
export function encodeShared(s: SharedProfile): string {
  return toB64(JSON.stringify({ i: s.id, n: s.name, p: s.program, s: s.skills, c: s.certs, r: s.resume, l: s.linkedin }));
}

/** Full link that goes into the QR code. */
export function badgeUrl(p: ProfileData): string {
  return `${window.location.origin}/p#d=${encodeShared(buildShared(p))}`;
}

const str = (v: unknown) => (typeof v === "string" ? v.slice(0, MAX_TEXT) : "");
const strList = (v: unknown) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, MAX_ITEMS).map((x) => x.slice(0, MAX_TEXT)) : [];

/** Decode the `d=` payload. Treats the data as untrusted: returns null if it isn't a valid badge. */
export function decodeShared(encoded: string): SharedProfile | null {
  try {
    const o = JSON.parse(fromB64(encoded));
    if (!o || typeof o !== "object") return null;
    const shared: SharedProfile = {
      id: str(o.i),
      name: str(o.n),
      program: str(o.p),
      skills: strList(o.s),
      certs: strList(o.c),
      resume: str(o.r),
      linkedin: normalizeLinkedin(str(o.l)),
    };
    return shared.id && shared.name ? shared : null;
  } catch {
    return null;
  }
}

/** Accepts a scanned/pasted badge link (or just its hash) and returns the profile plus the raw payload. */
export function parseBadgeLink(raw: string): { shared: SharedProfile; encoded: string } | null {
  const m = raw.match(/[#&?]d=([A-Za-z0-9_-]+)/);
  if (!m) return null;
  const shared = decodeShared(m[1]);
  return shared ? { shared, encoded: m[1] } : null;
}

/** Map a free-text program ("Software Development, SAIT") onto the employer filter groups. */
export function programGroup(program: string): string {
  const p = program.toLowerCase();
  if (p.includes("software") || p.includes("computer") || p.includes("web")) return "Software Dev";
  if (p.includes("data") || p.includes("analytic")) return "Data Analytics";
  if (p.includes("ux") || p.includes("design")) return "UX Design";
  return program.split(",")[0].trim() || "Other";
}
