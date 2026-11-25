import type { Connection } from "../ConnectionsContext";
import { programGroup } from "./badgeLink";

// Quote every cell, and prefix spreadsheet formula-like values with an apostrophe.
// This prevents CSV formula execution when opened in spreadsheet applications.
function cell(value: string | number): string {
  const raw = String(value);
  const safe = /^[\s\u0000-\u001f]*[=+@\-]/.test(raw) ? "'" + raw : raw;
  return '"' + safe.replace(/"/g, '""') + '"';
}

export function exportCandidatesCsv(connections: Connection[]): void {
  if (connections.length === 0) return;
  const headers = ["Name", "Program", "Skills", "Certifications", "Recruitment status", "Employer notes", "LinkedIn", "Date scanned"];
  const rows = connections.map((c) => [
    c.name, programGroup(c.program), c.skills.join(", "), c.certs.join(", "),
    c.status ?? "New", c.notes ?? "", c.linkedin,
    new Date(c.savedAt).toISOString(),
  ]);
  const csv = "\uFEFF" + [headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "badgein-candidates.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
