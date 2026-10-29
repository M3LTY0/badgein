import { Link } from "react-router-dom";
import Logo from "../components/Logo";

// TODO(logic): these chips are display-only. Decide whether they should link anywhere.
const chips = ["Register", "Scan", "Connect"];

export default function Inbox() {
  return (
    <div className="my-auto flex w-full flex-col items-center text-center">
      <Logo size={26} className="mb-5" />

      <h1 className="text-[17px] font-extrabold leading-tight text-white">
        Scan in.
        <br />
        <span className="text-brand">Badge in.</span>
      </h1>

      <p className="mt-3 max-w-[190px] text-[9.5px] leading-snug text-slate-300">
        No paper resumes. One scan, every connection.
      </p>

      <div className="mt-3 flex gap-1.5">
        {chips.map((c) => (
          <span key={c} className="rounded-md border border-line bg-chip px-2.5 py-2 text-[8.5px] font-semibold text-brand">
            {c}
          </span>
        ))}
      </div>

      {/* TODO(logic): real LinkedIn OAuth sign-in; on success, prefill name/program from the LinkedIn profile. */}
      <Link
        to="/profile"
        className="mt-3.5 w-full rounded-md bg-linkedin py-2.5 text-[10.5px] font-bold text-white transition hover:brightness-110"
      >
        Continue with LinkedIn
      </Link>
      {/* TODO(logic): manual sign-up (account creation) before moving on. */}
      <Link
        to="/profile"
        className="mt-2 w-full rounded-md border border-line bg-page/40 py-2.5 text-[10.5px] font-bold text-white transition hover:bg-chip"
      >
        Sign up manually
      </Link>
    </div>
  );
}
