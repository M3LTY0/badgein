import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SharedProfile } from "./lib/badgeLink";

export type RecruitmentStatus = "New" | "Interested" | "Follow up" | "Not interested";
export type Connection = SharedProfile & { savedAt: number; status?: RecruitmentStatus; notes?: string };
type Ctx = {
  connections: Connection[];
  add: (p: SharedProfile) => void;
  has: (id: string) => boolean;
  updateRecruitment: (id: string, changes: { status?: RecruitmentStatus; notes?: string }) => void;
};

export const CONNECTIONS_KEY = "badgein.connections";
const STORAGE_KEY = CONNECTIONS_KEY;

function load(): Connection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((c): c is Connection => c && typeof c === "object" && typeof c.id === "string" && typeof c.savedAt === "number") : [];
  } catch {
    return [];
  }
}

const ConnectionsCtx = createContext<Ctx | null>(null);

// TODO(backend): connections are stored per browser. Save them to the employer's account so every
// recruiter on the booth sees the same list.
export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const [connections, setConnections] = useState<Connection[]>(load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
    } catch {
      /* ignore */
    }
  }, [connections]);

  // Scanning the same badge again refreshes its data and keeps its place in the list.
  const add = (p: SharedProfile) =>
    setConnections((list) =>
      list.some((c) => c.id === p.id)
        ? list.map((c) => (c.id === p.id ? { ...p, savedAt: c.savedAt, status: c.status, notes: c.notes } : c))
        : [{ ...p, savedAt: Date.now() }, ...list]
    );
  const has = (id: string) => connections.some((c) => c.id === id);
  const updateRecruitment: Ctx["updateRecruitment"] = (id, changes) =>
    setConnections((list) => list.map((c) => c.id === id ? { ...c, ...changes } : c));

  return <ConnectionsCtx.Provider value={{ connections, add, has, updateRecruitment }}>{children}</ConnectionsCtx.Provider>;
}

export function useConnections() {
  const ctx = useContext(ConnectionsCtx);
  if (!ctx) throw new Error("useConnections must be used inside ConnectionsProvider");
  return ctx;
}
