import { useMemo, useState } from "react";
import { useProfile } from "../ProfileContext";

type Status = "New" | "Interested" | "Follow up" | "Not interested";
type Candidate = { name: string; program: string; skills: string; certs: string; status: Status };

const FILTERS = ["All", "Software Dev", "Data Analytics", "UX Design"] as const;

// TODO(logic): replace this mock list with candidates fetched from an API (people who scanned or tapped in).
const BASE: Candidate[] = [
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
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  // TODO(logic): save status changes to a backend; they currently reset on reload.
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [selected, setSelected] = useState("Brennan Carrier");

  const all = useMemo<Candidate[]>(
    () => [
      { name: profile.name, program: "Software Dev", skills: profile.skills.join(", ") || "—", certs: profile.certs.join(", ") || "None listed", status: "New" as Status },
      ...BASE,
    ].map((c) => ({ ...c, status: statuses[c.name] ?? c.status })),
    [profile, statuses]
  );
  const rows = all.filter((c) => filter === "All" || c.program === filter);
  const current = all.find((c) => c.name === selected) ?? all[0];
  const set = (s: Status) => setStatuses((p) => ({ ...p, [current.name]: s }));

  const stats = [
    { n: rows.length, label: "Connections" },
    { n: 0, label: "Paper resumes" }, // TODO(logic): hardcoded 0
    { n: rows.filter((c) => c.status === "New").length, label: "New" },
  ];

  return (
    <main className="employer-scale mx-auto w-full max-w-5xl flex-1 px-3 pb-10 pt-1">
      <section className="rounded-xl border border-line bg-phone p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* TODO(logic): employer and event name are hardcoded; take them from the signed-in employer account. */}
          <h1 className="text-[15px] font-extrabold">Northwind Tech · Career Fair 2026</h1>
          <div className="flex gap-1.5">
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
                    key={c.name}
                    onClick={() => setSelected(c.name)}
                    className={`cursor-pointer border-b border-line ${
                      c.name === current.name ? "bg-[#12306a]" : "hover:bg-chip/60"
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
            <div className="mt-2 space-y-[5px]" aria-hidden>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-px bg-brand/40" />
              ))}
            </div>
            {/* TODO(logic): show the candidate's actual uploaded resume here; the lines above are a placeholder. */}
            <p className="mt-3 text-[9.5px] text-slate-400">Resume preview</p>
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
  );
}
