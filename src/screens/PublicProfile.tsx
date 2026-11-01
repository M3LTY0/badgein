import { Link, useLocation } from "react-router-dom";
import { useConnections } from "../ConnectionsContext";
import { parseBadgeLink } from "../lib/badgeLink";

/** What opens when someone scans a badge with their phone's own camera (or after an in-app scan). */
export default function PublicProfile() {
  const { hash } = useLocation();
  const { add, has } = useConnections();
  const parsed = parseBadgeLink(hash);

  if (!parsed) {
    return (
      <div className="my-auto text-center">
        <p className="text-[12px] font-extrabold">Badge not found</p>
        <p className="mt-1.5 text-[9.5px] text-slate-300">This link is incomplete or isn't a badgeIn code.</p>
        <Link to="/" className="mt-3 inline-block text-[10px] font-bold text-brand">Go home</Link>
      </div>
    );
  }

  const p = parsed.shared;
  const saved = has(p.id);

  return (
    <div className="flex flex-1 flex-col">
      <Link to="/employer" className="self-start text-[9.5px] text-slate-300 hover:text-white">‹ Connections</Link>

      <div className="mt-3">
        <h2 className="text-[14px] font-extrabold leading-tight">{p.name}</h2>
        {p.program && <p className="mt-0.5 text-[9.5px] text-slate-300">{p.program}</p>}
      </div>

      <Section title="Skills">
        {p.skills.length ? <Chips items={p.skills} /> : <Empty />}
      </Section>
      <Section title="Certifications">
        {p.certs.length ? <Chips items={p.certs} /> : <Empty />}
      </Section>

      {/* TODO(backend): resume is only a file name for now. Upload the PDF to storage and link to it here. */}
      <Section title="Resume">
        {p.resume ? <p className="truncate text-[9.5px] text-white">📄 {p.resume}</p> : <Empty />}
      </Section>

      {p.linkedin && (
        <a
          href={p.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 rounded-lg bg-linkedin py-2 text-center text-[10px] font-bold text-white transition hover:brightness-110"
        >
          View LinkedIn
        </a>
      )}

      <div className="mt-auto pt-3">
        <button
          type="button"
          disabled={saved}
          onClick={() => add(p)}
          className={`w-full rounded-lg py-2.5 text-[11px] font-bold transition ${
            saved ? "border border-line text-green-400" : "bg-brand text-white hover:brightness-110"
          }`}
        >
          {saved ? "✓ Saved to connections" : "Save connection"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <p className="mb-1 text-[8px] uppercase tracking-wide text-slate-400">{title}</p>
      {children}
    </div>
  );
}

const Empty = () => <p className="text-[9.5px] text-slate-500">Not shared</p>;

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1">
      {items.map((s) => (
        <li key={s} className="rounded-full bg-chip px-2 py-0.5 text-[8.5px] font-medium text-brand">{s}</li>
      ))}
    </ul>
  );
}
