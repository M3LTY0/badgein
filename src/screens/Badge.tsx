import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import { useProfile } from "../ProfileContext";
import { badgeUrl } from "../lib/badgeLink";

export default function Badge() {
  const { profile } = useProfile();
  // TODO(logic): the event name ("Career Fair 2026") is hardcoded below; take it from the event the user checked in to.
  const programShort = profile.program.split(",")[0].trim();
  const { share } = profile;
  const shared = ["Skills", share.certs && "Certifications", share.resume && "Resume", share.linkedin && profile.linkedin && "LinkedIn"]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-1 flex-col">
      <Link to="/profile" className="self-start text-[9.5px] text-slate-300 hover:text-white">‹ Edit profile</Link>
      <h2 className="mt-2.5 text-[14px] font-extrabold">My badge</h2>

      <div className="mt-3 flex flex-col items-center rounded-xl bg-gradient-to-b from-brand-deep to-[#0a2f8a] px-3 pb-3 pt-3">
        <span className="h-1 w-9 rounded-full bg-white/80" />
        <p className="mt-3.5 text-[12.5px] font-extrabold leading-tight">{profile.name}</p>
        <p className="mt-0.5 text-[8.5px] text-blue-100">{programShort} · Career Fair 2026</p>
        {/* Encodes a link to this attendee's profile, honouring the sharing toggles on the profile screen. */}
        <div className="mt-2 rounded-lg bg-white p-1.5">
          <QRCodeSVG value={badgeUrl(profile)} size={140} level="M" fgColor="#0a3aa8" bgColor="#ffffff" marginSize={0} role="img" aria-label="Badge QR code" />
        </div>
        <p className="mt-3 text-[8px] text-blue-100">Show this to exchange info</p>
        <p className="mt-1 text-center text-[7.5px] text-blue-200/80">Shares: {shared}</p>
      </div>

      {/* TODO(logic): Add to wallet (Apple/Google Wallet pass). */}
      <button type="button" className="mt-2.5 w-full rounded-lg border border-line py-2.5 text-[11px] font-bold text-white transition hover:bg-chip">
        Add to wallet
      </button>
      {/* TODO(logic): NFC read, once tap-to-connect is built. */}
      <Link to="/scan" className="mt-2 block w-full rounded-lg bg-brand py-2.5 text-center text-[11px] font-bold text-white transition hover:brightness-110">
        Scan a badge
      </Link>
    </div>
  );
}
