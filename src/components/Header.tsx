import { NavLink, useLocation } from "react-router-dom";
import Logo from "./Logo";

// Sizes here are in px on purpose: the phone screens scale up on real phones (see index.css), the header does not.
export default function Header() {
  const { pathname } = useLocation();
  const isEmployer = pathname.startsWith("/employer");

  const tab = (active: boolean) =>
    `px-[12px] py-[6px] text-[12px] font-medium transition-colors ${
      active ? "bg-brand text-white" : "bg-chip text-white/90 hover:bg-line"
    }`;

  return (
    <header className="flex items-center justify-between px-[12px] py-[10px]">
      <NavLink to="/" className="flex items-baseline gap-[8px]">
        <Logo size={22} />
        <span className="text-[10px] text-blue-300/70">prototype</span>
      </NavLink>
      <nav className="flex overflow-hidden rounded-[6px] border border-line" aria-label="Role">
        <NavLink to="/" className={tab(!isEmployer)}>Attendee</NavLink>
        <NavLink to="/employer" className={tab(isEmployer)}>Employer</NavLink>
      </nav>
    </header>
  );
}
