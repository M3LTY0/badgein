type Props = { size?: number; showWordmark?: boolean; className?: string };

/** badgeIn mark: blue badge, QR-style "N", NFC arcs. Geometry follows the brand poster. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size * 1.45} height={size} viewBox="0 0 145 100" fill="none" aria-hidden>
      <rect x="0" y="0" width="82" height="100" rx="18" fill="#0d5cff" />
      <rect x="28" y="6" width="26" height="5" rx="2.5" fill="#dbe6ff" />
      <rect x="9" y="19" width="64" height="72" rx="10" fill="#fff" />
      {/* QR finder squares */}
      {[[13, 23], [56, 23], [13, 74]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="9" height="9" rx="2" stroke="#0a3aa8" strokeWidth="2.5" />
      ))}
      {/* pixel N */}
      {[
        [22, 32], [22, 42], [22, 52], [22, 62],
        [51, 32], [51, 42], [51, 52], [51, 62],
        [31, 42], [37, 50], [43, 56],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" rx="1.5" fill="#0d5cff" />
      ))}
      {/* NFC arcs */}
      <path d="M94 38a18 18 0 0 1 0 24" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
      <path d="M104 28a32 32 0 0 1 0 44" stroke="#3b82f6" strokeOpacity=".6" strokeWidth="5" strokeLinecap="round" />
      <path d="M114 18a46 46 0 0 1 0 64" stroke="#3b82f6" strokeOpacity=".35" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ size = 32, showWordmark = true, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <LogoMark size={size} />
      {showWordmark && (
        <span className="font-extrabold tracking-tight text-white" style={{ fontSize: size * 0.75 }}>
          badge <span className="text-brand">In</span>
        </span>
      )}
    </span>
  );
}
