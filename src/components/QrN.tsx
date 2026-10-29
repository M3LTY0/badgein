/** QR-style badge code with the pixel "N" — same geometry as the logo mark. */
export default function QrN({ className = "" }: { className?: string }) {
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x + 1.75} y={y + 1.75} width="13.5" height="13.5" rx="3" fill="none" stroke="#0a3aa8" strokeWidth="3.5" />
      <rect x={x + 6} y={y + 6} width="5" height="5" rx="1" fill="#0a3aa8" />
    </g>
  );
  const px: [number, number][] = [
    [28, 24.5], [28, 34.5], [28, 44.5], [28, 54.5], [28, 64.5],
    [68, 24.5], [68, 34.5], [68, 44.5], [68, 54.5], [68, 64.5],
    [38, 34.5], [48, 44.5], [58, 54.5],
  ];
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Badge QR code">
      <rect width="100" height="100" rx="8" fill="#fff" />
      {[[7.5, 7.5], [75.5, 7.5], [7.5, 75.5]].map(([x, y]) => finder(x, y))}
      {px.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="9" height="9" rx="2" fill="#0d5cff" />)}
    </svg>
  );
}
