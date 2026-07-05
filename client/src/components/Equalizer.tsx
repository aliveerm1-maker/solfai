export function Equalizer({ bars = 4, className = "" }: { bars?: number; className?: string }) {
  return (
    <span className={"inline-flex items-end gap-[2px] h-3 " + className} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-[color:var(--teal)]"
          style={{
            animation: `eqBar 1.2s ease-in-out ${i * 0.15}s infinite`,
            transformOrigin: "bottom",
            boxShadow: "0 0 6px color-mix(in oklab, var(--teal) 70%, transparent)",
          }}
        />
      ))}
      <style>{`
        @keyframes eqBar {
          0%,100% { height: 3px; opacity: .55 }
          50%     { height: 12px; opacity: 1 }
        }
      `}</style>
    </span>
  );
}
