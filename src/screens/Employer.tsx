import { useEffect, useMemo, useState } from "react";
import Scanner from "../components/Scanner";
import { useConnections } from "../ConnectionsContext";
import { programGroup } from "../lib/badgeLink";
import { useProfile } from "../ProfileContext";

type Status = "New" | "Interested" | "Follow up" | "Not interested";
type Candidate = {
  /** Unique row key: the badge ID for scanned people, the name for the mock rows. */
  key: string;
  name: string; program: string; skills: string; certs: string; status: Status;
  resume?: string; linkedin?: string; scanned?: boolean;
};

const FILTERS = ["All", "Software Dev", "Data Analytics", "UX Design"] as const;

// TODO(logic): replace this mock list with candidates fetched from an API (people who scanned or tapped in).
const BASE: Omit<Candidate, "key">[] = [
  { name: "Priya Shah", program: "Data Analytics", skills: "SQL, Tableau", certs: "Google Data Analytics", status: "Interested" },
  { name: "Jordan Lee", program: "Software Dev", skills: "Java, AWS", certs: "AWS Certified Cloud Practitioner", status: "Follow up" },
  { name: "Sam Okafor", program: "UX Design", skills: "Figma, Research", certs: "None listed", status: "Interested" },
  { name: "Maya Chen", program: "Data Analytics", skills: "Python, Power BI", certs: "Microsoft Power BI Data Analyst", status: "New" },
  { name: "Liam Brooks", program: "Software Dev", skills: "C#, Azure", certs: "Azure Fundamentals (AZ-900)", status: "Follow up" },
  { name: "Aisha Rahman", program: "UX Design", skills: "Figma, Prototyping", certs: "Google UX Design", status: "New" },
  { name: "Daniel Kim", program: "Software Dev", skills: "Python, Django", certs: "None listed", status: "Not interested" },
  { name: "Chloe Martin", program: "UX Design", skills: "Research, Wireframing", certs: "None listed", status: "Follow up" },
  { name: "Omar Haddad", program: "Data Analytics", skills: "Excel, R", certs: "None listed", status: "Not interested" },
];

const pill = (s: Status) =>
  s === "New"
    ? "bg-[#2f6fe0] text-white"
    : s === "Interested"
    ? "bg-green-500/15 text-green-400"
    : s === "Follow up"
    ? "bg-yellow-400/15 text-yellow-300"
    : "bg-red-500/15 text-red-400";

export default function Employer() {
  const { profile } = useProfile();
  const { connections, add } = useConnections();
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  // TODO(logic): save status changes to a backend; they currently reset on reload.
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [selected, setSelected] = useState("Brennan Carrier");

  // Close the scan dialog with Escape.
  useEffect(() => {
    if (!scanning) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setScanning(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scanning]);

  const all = useMemo<Candidate[]>(() => {
    const scanned: Candidate[] = connections.map((c) => ({
      key: c.id,
      name: c.name,
      program: programGroup(c.program),
      skills: c.skills.join(", ") || "—",
      certs: c.certs.join(", ") || "None listed",
      status: "New",
      resume: c.resume,
      linkedin: c.linkedin,
      scanned: true,
    }));
    // The signed-in demo user's own row is only shown until they appear as a real scanned connection.
    const self: Candidate[] = connections.some((c) => c.id === profile.id)
      ? []
      : [{ key: profile.name, name: profile.name, program: "Software Dev", skills: profile.skills.join(", ") || "—", certs: profile.certs.join(", ") || "None listed", status: "New" }];
    return [...scanned, ...self, ...BASE.map((c) => ({ ...c, key: c.name }))].map((c) => ({
      ...c,
      status: statuses[c.key] ?? c.status,
    }));
  }, [profile, statuses, connections]);
  const rows = all.filter((c) => filter === "All" || c.program === filter);
  const current = all.find((c) => c.key === selected) ?? all[0];
  const set = (s: Status) => setStatuses((p) => ({ ...p, [current.key]: s }));

  const stats = [
    { n: rows.length, label: "Connections" },
    { n: 0, label: "Paper resumes" }, // TODO(logic): hardcoded 0
    { n: rows.filter((c) => c.status === "New").length, label: "New" },
  ];

  return (
    <>
    <main className="employer-scale mx-auto w-full max-w-5xl flex-1 px-3 pb-10 pt-1">
      <section className="rounded-xl border border-line bg-phone p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* TODO(logic): employer and event name are hardcoded; take them from the signed-in employer account. */}
          <h1 className="text-[15px] font-extrabold">Northwind Tech · Career Fair 2026</h1>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setScanning(true)}
              className="rounded-full bg-brand px-3 py-1 text-[9px] font-bold text-white hover:brightness-110"
            >
              Scan badge
            </button>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${
                  filter === f ? "bg-brand text-white" : "bg-chip text-brand hover:bg-line"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-line px-2.5 py-2">
              <p className="text-[15px] font-extrabold leading-tight">{s.n}</p>
              <p className="text-[10px] text-slate-300">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_200px]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-[9px]">
              <thead className="text-slate-400">
                <tr>
                  {["Candidate", "Program", "Skills", "Status"].map((h) => (
                    <th key={h} className="px-2 py-2 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr
                    key={c.key}
                    onClick={() => setSelected(c.key)}
                    className={`cursor-pointer border-b border-line ${
                      c.key === current.key ? "bg-[#12306a]" : "hover:bg-chip/60"
                    }`}
                  >
                    <td className="px-2 py-1.5 font-bold">{c.name}</td>
                    <td className="px-2 py-1.5">{c.program}</td>
                    <td className="px-2 py-1.5">{c.skills}</td>
                    <td className="px-2 py-1.5">
                      <span className={`rounded px-1.5 py-0.5 ${pill(c.status)}`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <aside className="flex flex-col rounded-lg border border-line p-2.5">
            <h2 className="text-[12px] font-extrabold">{current.name}</h2>
            <p className="mt-1.5 text-[9.5px] text-slate-400">{current.program}</p>
            <p className="mt-3 text-[9.5px] text-slate-400">Certifications</p>
            <p className="mt-1.5 text-[9px] text-slate-300">{current.certs}</p>
            {current.scanned ? (
              <>
                <p className="mt-3 text-[9.5px] text-slate-400">Skills</p>
                <p className="mt-1.5 text-[9px] text-slate-300">{current.skills}</p>
                <p className="mt-3 text-[9.5px] text-slate-400">Resume</p>
                {/* TODO(backend): only the file name travels with the badge; link to the stored PDF once uploads exist. */}
                <p className="mt-1.5 truncate text-[9px] text-slate-300">{current.resume ? `📄 ${current.resume}` : "Not shared"}</p>
                {current.linkedin && (
                  <a
                    href={current.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 rounded-lg bg-linkedin py-2 text-center text-[10px] font-bold text-white transition hover:brightness-110"
                  >
                    View LinkedIn
                  </a>
                )}
              </>
            ) : (
              <>
                <div className="mt-2 space-y-[5px]" aria-hidden>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-px bg-brand/40" />
                  ))}
                </div>
                {/* Mock candidates have no real resume; the lines above are a placeholder. */}
                <p className="mt-3 text-[9.5px] text-slate-400">Resume preview</p>
              </>
            )}
            <button
              onClick={() => set("Interested")}
              className="mt-2 rounded-lg bg-brand py-2 text-[10px] font-bold transition hover:brightness-110"
            >
              Mark interested
            </button>
            <button
              onClick={() => set("Follow up")}
              className="mt-1.5 rounded-lg border border-line py-2 text-[10px] font-bold transition hover:bg-chip"
            >
              Follow up later
            </button>
            <button
              onClick={() => set("Not interested")}
              className="mt-1.5 rounded-lg border border-red-500/40 py-2 text-[10px] font-bold text-red-400 transition hover:bg-red-500/10"
            >
              Not interested
            </button>
          </aside>
        </div>
      </section>
    </main>

    {scanning && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Scan a badge"
        onClick={() => setScanning(false)}
      >
        <div
          className="employer-scale w-[260px] rounded-xl border border-line bg-phone p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[12px] font-extrabold">Scan a badge</h2>
            <button onClick={() => setScanning(false)} aria-label="Close" className="text-[14px] leading-none text-slate-300 hover:text-white">×</button>
          </div>
          <Scanner
            onProfile={(shared) => {
              add(shared);
              setSelected(shared.id);
              setFilter("All");
              setScanning(false);
            }}
          />
        </div>
      </div>
    )}
    </>
  );
}
