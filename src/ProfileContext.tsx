import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ShareSettings = { resume: boolean; certs: boolean; linkedin: boolean };

export type ProfileData = {
  /** Stable badge ID, generated once and stored. This is what employers' saved connections are keyed on. */
  id: string;
  name: string; program: string; skills: string[]; certs: string[]; resume: string;
  linkedin: string;
  /** What the badge QR reveals. Name, program and skills are always shared. */
  share: ShareSettings;
};
type Ctx = { profile: ProfileData; update: (patch: Partial<ProfileData>) => void };

const STORAGE_KEY = "badgein.profile";

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);

// TODO(logic): prefill this from the signed-in user instead of hardcoded demo data.
const defaults: ProfileData = {
  id: newId(),
  name: "Brennan Carrier",
  program: "Software Development, SAIT",
  skills: [],
  certs: [],
  resume: "Brennan_Carrier_Resume.pdf",
  linkedin: "",
  share: { resume: true, certs: true, linkedin: true },
};

function load(): ProfileData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<ProfileData>;
      return { ...defaults, ...saved, share: { ...defaults.share, ...saved.share } };
    }
  } catch {
    /* storage unavailable or corrupt: fall back to defaults */
  }
  return defaults;
}

const ProfileCtx = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  // TODO(logic): persist to an API instead of (just) localStorage.
  const [profile, setProfile] = useState<ProfileData>(load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      /* ignore */
    }
  }, [profile]);
  const update = (patch: Partial<ProfileData>) => setProfile((p) => ({ ...p, ...patch }));
  return <ProfileCtx.Provider value={{ profile, update }}>{children}</ProfileCtx.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileCtx);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
