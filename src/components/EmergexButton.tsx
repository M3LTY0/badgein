import { emergexBoothUrl } from "../lib/emergex";

/** "Here for emergeX?" tile that opens our booth page on emergex.dev in a new tab. Hidden if the booth address isn't valid. */
export default function EmergexButton() {
  const href = emergexBoothUrl();
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="Here for emergeX? Open our booth page"
      className="group relative block h-[3.75rem] overflow-hidden rounded-[0.6875rem] bg-[#2b2b2b] transition hover:brightness-110 active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      {/* Two sharp-edged diagonal stripes across the top right corner (emergeX pink and orange) */}
      <svg viewBox="0 0 40 40" aria-hidden="true" className="absolute right-0 top-0 size-[2.625rem]">
        <polygon points="18,0 26,0 40,14 40,22" fill="#f044e0" />
        <polygon points="29,0 39,0 40,1 40,11" fill="#f4b448" />
      </svg>
      <span className="absolute left-2.5 top-2 font-dm text-[0.5156rem] font-medium text-[#c9c4cc]">Here for</span>
      <img src="/emergex.png" alt="" className="absolute inset-0 m-auto h-[3.0625rem] w-auto" />
      <span className="absolute bottom-1.5 right-2 text-white/75 transition group-hover:text-white">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[0.625rem] fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]">
          <path d="M7 17 17 7M8 7h9v9" />
        </svg>
      </span>
    </a>
  );
}
