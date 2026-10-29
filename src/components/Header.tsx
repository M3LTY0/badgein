import { NavLink, useLocation } from "react-router-dom";
import Logo from "./Logo";

export default function Header() {
  const { pathname } = useLocation();
  const isEmployer = pathname.startsWith("/employer");

  const tab = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium transition-colors ${
      active ? "bg-brand text-white" : "bg-chip text-white/90 hover:bg-line"
    }`;

  return (
    <header className="flex items-center justify-between px-3 py-2.5">
      <NavLink to="/" className="flex items-baseline gap-2">
        <Logo size={22} />
        <span className="text-[10px] text-blue-300/70">prototype</span>
      </NavLink>
      <nav className="flex overflow-hidden rounded-md border border-line" aria-label="Role">
        <NavLink to="/" className={tab(!isEmployer)}>Attendee</NavLink>
        <NavLink to="/employer" className={tab(isEmployer)}>Employer</NavLink>
      </nav>
    </header>
  );
}
