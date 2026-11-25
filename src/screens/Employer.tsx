import { useEffect, useMemo, useState } from "react";
import Scanner from "../components/Scanner";
import { useConnections, type RecruitmentStatus } from "../ConnectionsContext";
import { exportCandidatesCsv } from "../lib/exportCandidates";
import { programGroup } from "../lib/badgeLink";
import { useAccount } from "../AccountContext";

type Status = RecruitmentStatus;
type Candidate = {
  /** The badge ID. */
  key: string;
  name: string; program: string; skills: string; certs: string; status: Status;
  resume: string; linkedin: string; notes: string; savedAt: number;
};

const FILTERS = ["All", "Software Dev", "Data Analytics", "UX Design"] as const;

const pill = (s: Status) =>
  s === "New"
    ? "bg-[#2f6fe0] text-white"
    : s === "Interested"
    ? "bg-green-500/15 text-green-400"
    : s === "Follow up"
    ? "bg-yellow-400/15 text-yellow-300"
    : "bg-red-500/15 text-red-400";

export default function Employer() {
  const { account } = useAccount();
  const { connections, add, updateRecruitment } = useConnections();
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [selected, setSelected] = useState("");

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
      status: c.status ?? "New",
      notes: c.notes ?? "",
      savedAt: c.savedAt,
      resume: c.resume,
      linkedin: c.linkedin,
    }));
    return scanned;
  }, [connections]);
  const rows = all.filter((c) => filter === "All" || c.program === filter);
  const current = all.find((c) => c.key === selected) ?? all[0];
  const set = (s: Status) => current && updateRecruitment(current.key, { status: s });

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
          {/* TODO(logic): the event name is hardcoded; take it from the event the employer is attending. */}
          <h1 className="text-[15px] font-extrabold">{account?.org || account?.name} · Career Fair 2026</h1>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={connections.length === 0}
              onClick={() => exportCandidatesCsv(connections)}
              className="rounded-full border border-line px-3 py-1 text-[9px] font-bold text-white hover:bg-chip disabled:cursor-not-allowed disabled:opacity-40"
            >
              Export CSV
            </button>
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

        {!current ? (
          <div className="mt-3 rounded-lg border border-dashed border-line px-3 py-8 text-center">
            <p className="text-[12px] font-extrabold">No badges yet</p>
            <p className="mt-1 text-[10px] text-slate-300">Tap Scan badge, then scan or paste someone's badge link. They'll appear here.</p>
          </div>
        ) : (
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
                {rows.length === 0 && (
                  <tr><td colSpan={4} className="px-2 py-4 text-center text-slate-400">No one in this group yet.</td></tr>
                )}
                {rows.map((c) => (
                  <tr
                    key={c.key}
                    onClick={() => setSelected(c.key)}
                    className={`cursor-pointer border-b border-line ${
                      c.key === current?.key ? "bg-[#12306a]" : "hover:bg-chip/60"
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
            <label htmlFor="employer-candidate-notes" className="mt-3 text-[9.5px] text-slate-400">Private notes (saved on this device)</label>
            <textarea
              id="employer-candidate-notes"
              key={current.key}
              value={current.notes}
              onChange={(e) => updateRecruitment(current.key, { notes: e.target.value })}
              maxLength={3000}
              rows={4}
              placeholder="Notes about this candidate..."
              className="mt-1 w-full resize-y rounded-lg border border-line bg-chip p-2 text-[10px] text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <p className="mt-1 text-[9px] text-slate-400">Status: {current.status}</p>
            <button
              onClick={() => set("New")}
              className="mt-2 rounded-lg border border-line py-2 text-[10px] font-bold transition hover:bg-chip"
            >
              Mark new
            </button>
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
        )}
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
            <h2 className="text-[12px] font-extrabold">Add a badge</h2>
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
