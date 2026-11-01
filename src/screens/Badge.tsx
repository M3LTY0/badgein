import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import { useProfile } from "../ProfileContext";
import { badgeUrl } from "../lib/badgeLink";

export default function Badge() {
  const { profile } = useProfile();
  const url = badgeUrl(profile);
  const linkRef = useRef<HTMLInputElement>(null);
  const copiedTimer = useRef<number>(0);
  const [copied, setCopied] = useState(false);
  // TODO(logic): the event name ("Career Fair 2026") is hardcoded below; take it from the event the user checked in to.
  const programShort = profile.program.split(",")[0].trim();
  const { share } = profile;
  const shared = ["Skills", share.certs && "Certifications", share.resume && "Resume", share.linkedin && profile.linkedin && "LinkedIn"]
    .filter(Boolean)
    .join(" · ");

  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);

  const copyLink = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      const input = linkRef.current;
      if (input) {
        input.focus();
        input.select();
        ok = document.execCommand("copy");
      }
    }
    if (!ok) return;
    setCopied(true);
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
  };

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
          <QRCodeSVG value={url} size={140} level="M" fgColor="#0a3aa8" bgColor="#ffffff" marginSize={0} role="img" aria-label="Badge QR code" />
        </div>
        <label className="mt-2 w-full">
          <span className="sr-only">Badge link</span>
          <input
            ref={linkRef}
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
            className="w-full truncate rounded-md border border-white/20 bg-black/20 px-1.5 py-1 text-[7.5px] text-blue-50 outline-none"
          />
        </label>
        <button
          type="button"
          onClick={copyLink}
          className="mt-1.5 w-full rounded-md bg-white py-1.5 text-[9.5px] font-bold text-brand-deep hover:brightness-110"
        >
          {copied ? "Copied" : "Copy badge link"}
        </button>
        <p className="mt-1.5 text-center text-[7.5px] leading-snug text-blue-100">
          Share this link, or paste it on Scan in place of a QR scan
        </p>
        <p className="mt-2 text-center text-[7.5px] text-blue-200/80">Shares: {shared}</p>
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
