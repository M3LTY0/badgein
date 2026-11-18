import { NavLink } from "react-router-dom";
import { useAccount } from "../AccountContext";
import { useProfile } from "../ProfileContext";
import Logo from "./Logo";

// Sizes here are in px on purpose: the phone screens scale up on real phones (see index.css), the header does not.
export default function Header() {
  const { account, signOut } = useAccount();
  const { profile } = useProfile();

  const confirmSignOut = () => {
    if (window.confirm("Sign out? This deletes your account and everything saved on this device, including saved connections. It can't be undone.")) signOut();
  };

  // Attendees can rename themselves on the profile screen, so show that name.
  const shownName = account?.role === "attendee" ? profile.name || account.name : account?.name;

  return (
    <header className="flex items-center justify-between gap-[8px] px-[12px] py-[10px]">
      <NavLink to="/" className="flex items-baseline gap-[8px]">
        <Logo size={22} />
        <span className="text-[10px] text-blue-300/70">prototype</span>
      </NavLink>
      {account && (
        <div className="flex min-w-0 items-center gap-[8px]">
          <span className="min-w-0 truncate text-[12px] font-medium text-white/90">{shownName}</span>
          <span className="flex-none rounded-[4px] bg-chip px-[6px] py-[2px] text-[10px] font-semibold text-brand">
            {account.role === "employer" ? "Employer" : "Attendee"}
          </span>
          <button
            type="button"
            onClick={confirmSignOut}
            className="flex-none rounded-[6px] border border-line px-[10px] py-[5px] text-[12px] font-medium text-white/90 transition-colors hover:bg-chip"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
