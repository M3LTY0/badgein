import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { homeFor, useAccount, type Role } from "../AccountContext";
import { useProfile } from "../ProfileContext";
import { supabase } from "../lib/supabase";

const inputCls = "w-full bg-transparent text-[0.6562rem] text-white outline-none placeholder:text-slate-500";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block rounded-lg border border-line px-2 py-1.5">
      <span className="block text-[0.5rem] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

const ROLES: { value: Role; label: string }[] = [
  { value: "attendee", label: "I'm attending" },
  { value: "employer", label: "I'm recruiting" },
];

/** Create the account for this device. No password: it is stored in this browser only. */
export default function Welcome() {
  const justCreated = useRef(false);
  const { account, createAccount } = useAccount();
  const { update } = useProfile();
  const [role, setRole] = useState<Role>("attendee");
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [error, setError] = useState("");

  // Coming back from LinkedIn: create the local attendee account from the LinkedIn name.
  useEffect(() => {
    if (account) return;
    if (sessionStorage.getItem("badgein-linkedin") !== "1") return;
    sessionStorage.removeItem("badgein-linkedin");
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (!user) return;
      const n = (user.user_metadata?.name as string) || user.email || "Attendee";
      update({ name: n });
      justCreated.current = true;
      createAccount({ role: "attendee", name: n, org: "" });
    });
  }, [account]);

  // Someone who is already signed in just gets sent home. Someone who has just signed up lands on the profile screen
  // to fill it in (attendees) or on the dashboard (employers).
  if (account) return <Navigate to={justCreated.current && account.role === "attendee" ? "/profile" : homeFor(account.role)} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    const o = org.trim();
    if (!n) return setError("Enter your name");
    if (role === "employer" && !o) return setError("Enter your company");
    if (role === "attendee") update({ name: n });
    justCreated.current = true;
    createAccount({ role, name: n, org: role === "employer" ? o : "" });
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col" noValidate>
      <h2 className="text-[0.875rem] font-extrabold">Create your account</h2>
      <p className="mb-3 mt-1 text-[0.5625rem] text-slate-300">Saved on this device only. No password needed.</p>

      <div className="mb-2 flex overflow-hidden rounded-lg border border-line" role="radiogroup" aria-label="Account type">
        {ROLES.map((r) => (
          <button
            key={r.value}
            type="button"
            role="radio"
            aria-checked={role === r.value}
            onClick={() => { setRole(r.value); setError(""); }}
            className={`flex-1 py-2 text-[0.5938rem] font-bold transition-colors ${role === r.value ? "bg-brand text-white" : "bg-chip text-slate-300 hover:bg-line"}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Field label="Your name">
          <input className={inputCls} value={name} maxLength={80} autoComplete="name" placeholder="Alex Morgan" onChange={(e) => { setName(e.target.value); setError(""); }} />
        </Field>
        {role === "employer" && (
          <Field label="Company">
            <input className={inputCls} value={org} maxLength={80} autoComplete="organization" placeholder="Northwind Tech" onChange={(e) => { setOrg(e.target.value); setError(""); }} />
          </Field>
        )}
      </div>

      {error && <p role="alert" className="mt-2 text-[0.5625rem] text-red-400">{error}</p>}

      <button type="submit" className="mt-3 w-full rounded-lg bg-brand py-2.5 text-[0.6875rem] font-bold text-white transition hover:brightness-110">
        Create account
      </button>
    </form>
  );
}