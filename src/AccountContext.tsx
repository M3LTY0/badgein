import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { CONNECTIONS_KEY } from "./ConnectionsContext";
import { PROFILE_KEY } from "./ProfileContext";

export type Role = "attendee" | "employer";

/** The one account on this browser. There is no password: it lives in localStorage, so anyone using this device can use it. */
export type Account = { role: Role; name: string; /** Company, for employers. */ org: string; createdAt: number };

type Ctx = {
  account: Account | null;
  createAccount: (a: Omit<Account, "createdAt">) => void;
  /** Deletes the account and everything saved on this device (profile, saved connections), then reloads. */
  signOut: () => void;
};

const ACCOUNT_KEY = "badgein.account";
const MAX = 80;

/** Where each role lands after signing in. */
export const homeFor = (role: Role) => (role === "employer" ? "/employer" : "/badge");

// TODO(backend): accounts are per browser. For booth visitors to show up on every employer's screen without being
// scanned, save accounts to an API instead of (or as well as) localStorage.
function load(): Account | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    const a = JSON.parse(raw);
    if (!a || typeof a !== "object" || (a.role !== "attendee" && a.role !== "employer") || typeof a.name !== "string" || !a.name) return null;
    return {
      role: a.role,
      name: a.name.slice(0, MAX),
      org: typeof a.org === "string" ? a.org.slice(0, MAX) : "",
      createdAt: typeof a.createdAt === "number" ? a.createdAt : Date.now(),
    };
  } catch {
    return null; // storage unavailable or corrupt: treat as signed out
  }
}

const AccountCtx = createContext<Ctx | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(load);

  // Keep other open tabs in step (signing out in one tab signs out the rest).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === ACCOUNT_KEY || e.key === null) setAccount(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const createAccount: Ctx["createAccount"] = (a) => {
    const next: Account = { role: a.role, name: a.name.trim().slice(0, MAX), org: a.org.trim().slice(0, MAX), createdAt: Date.now() };
    try {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
    } catch {
      /* storage blocked: the account lasts until the page is closed */
    }
    setAccount(next);
  };

  const signOut = () => {
    try {
      for (const k of [ACCOUNT_KEY, PROFILE_KEY, CONNECTIONS_KEY]) localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
    // A full reload resets every context's in-memory copy too.
    window.location.assign("/");
  };

  return <AccountCtx.Provider value={{ account, createAccount, signOut }}>{children}</AccountCtx.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountCtx);
  if (!ctx) throw new Error("useAccount must be used inside AccountProvider");
  return ctx;
}
