import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "../ProfileContext";

// TODO(logic): load skills and certifications from an API instead of hardcoded lists.
export const SKILLS = [
  "JavaScript", "Python", "Java", "C#", "SQL", "HTML/CSS", "React", "UX Design",
  "Data Analysis", "Cloud (AWS/Azure)", "Project Management", "Communication", "Teamwork",
];

// Generic sample data for the prototype.
export const CERTIFICATIONS = [
  "AWS Certified Cloud Practitioner", "Microsoft Azure Fundamentals (AZ-900)", "CompTIA Security+",
  "Google Cloud Digital Leader", "Oracle Certified Java Programmer", "Certified Scrum Master (CSM)",
  "Meta Front-End Developer", "Cisco CCNA",
];

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
  const { name, program, skills, certs, resume } = profile;
  const setName = (v: string) => update({ name: v });
  const setProgram = (v: string) => update({ program: v });
  const setSkills = (v: string[]) => update({ skills: v });
  const setCerts = (v: string[]) => update({ certs: v });
  const setResume = (v: string) => update({ resume: v });

  return (
    <form
      className="flex flex-1 flex-col"
      // TODO(logic): validate fields and save the profile to a backend, and generate the badge ID, before navigating.
      onSubmit={(e) => { e.preventDefault(); navigate("/badge"); }}
    >
      <Link to="/" className="self-start text-[9.5px] text-slate-300 hover:text-white">‹ Back</Link>
      <h2 className="mt-2.5 text-[14px] font-extrabold">Your profile</h2>

      <div className="mb-3 mt-3 flex flex-col gap-2.5">
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

        <label className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border-2 border-dashed border-brand px-2 py-2.5 text-[9px] text-white">
          <input
            type="file"
            accept=".pdf"
            className="sr-only"
            // TODO(logic): upload the PDF to storage; this only keeps the file name.
            onChange={(e) => setResume(e.target.files?.[0]?.name ?? "")}
          />
          {resume ? (
            <>
              <span className="truncate">{resume}</span>
              <span className="whitespace-nowrap text-brand">✓ Uploaded</span>
            </>
          ) : (
            <span className="text-brand">Upload resume (PDF)</span>
          )}
        </label>
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
