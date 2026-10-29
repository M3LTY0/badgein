import { Link } from "react-router-dom";
import QrN from "../components/QrN";
import { useProfile } from "../ProfileContext";

export default function Badge() {
  const { profile } = useProfile();
  // TODO(logic): the event name ("Career Fair 2026") is hardcoded below; take it from the event the user checked in to.
  const programShort = profile.program.split(",")[0].trim();

  return (
    <div className="flex flex-1 flex-col">
      <Link to="/profile" className="self-start text-[9.5px] text-slate-300 hover:text-white">‹ Edit profile</Link>
      <h2 className="mt-2.5 text-[14px] font-extrabold">My badge</h2>

      <div className="mt-3 flex flex-col items-center rounded-xl bg-gradient-to-b from-brand-deep to-[#0a2f8a] px-3 pb-3 pt-3">
        <span className="h-1 w-9 rounded-full bg-white/80" />
        <p className="mt-3.5 text-[12.5px] font-extrabold leading-tight">{profile.name}</p>
        <p className="mt-0.5 text-[8.5px] text-blue-100">{programShort} · Career Fair 2026</p>
        {/* TODO(logic): this QR is a static graphic; generate a real QR encoding this user's badge URL or ID. */}
        <QrN className="mt-2 w-[125px] rounded-lg" />
        <p className="mt-3 text-[8px] text-blue-100">Show this to exchange info</p>
      </div>

      {/* TODO(logic): Add to wallet (Apple/Google Wallet pass). */}
      <button type="button" className="mt-2.5 w-full rounded-lg border border-line py-2.5 text-[11px] font-bold text-white transition hover:bg-chip">
        Add to wallet
      </button>
      {/* TODO(logic): Scan a badge (camera QR scan / NFC read), then record the connection. */}
      <button type="button" className="mt-2 w-full rounded-lg bg-brand py-2.5 text-[11px] font-bold text-white transition hover:brightness-110">
        Scan a badge
      </button>
    </div>
  );
}
