import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SharedProfile } from "./lib/badgeLink";

export type Connection = SharedProfile & { savedAt: number };
type Ctx = {
  connections: Connection[];
  add: (p: SharedProfile) => void;
  has: (id: string) => boolean;
};

const STORAGE_KEY = "badgein.connections";

function load(): Connection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
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
        ? list.map((c) => (c.id === p.id ? { ...p, savedAt: c.savedAt } : c))
        : [{ ...p, savedAt: Date.now() }, ...list]
    );
  const has = (id: string) => connections.some((c) => c.id === id);

  return <ConnectionsCtx.Provider value={{ connections, add, has }}>{children}</ConnectionsCtx.Provider>;
}

export function useConnections() {
  const ctx = useContext(ConnectionsCtx);
  if (!ctx) throw new Error("useConnections must be used inside ConnectionsProvider");
  return ctx;
}
