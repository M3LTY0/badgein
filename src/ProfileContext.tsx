import { createContext, useContext, useState, type ReactNode } from "react";

export type ProfileData = {
  name: string; program: string; skills: string[]; certs: string[]; resume: string;
};
type Ctx = { profile: ProfileData; update: (patch: Partial<ProfileData>) => void };

// TODO(logic): prefill this from the signed-in user instead of hardcoded demo data.
const defaults: ProfileData = {
  name: "Brennan Carrier",
  program: "Software Development, SAIT",
  skills: [],
  certs: [],
  resume: "Brennan_Carrier_Resume.pdf",
};

const ProfileCtx = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  // TODO(logic): persist (localStorage or an API) so a page reload keeps the profile.
  const [profile, setProfile] = useState<ProfileData>(defaults);
  const update = (patch: Partial<ProfileData>) => setProfile((p) => ({ ...p, ...patch }));
  return <ProfileCtx.Provider value={{ profile, update }}>{children}</ProfileCtx.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileCtx);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
