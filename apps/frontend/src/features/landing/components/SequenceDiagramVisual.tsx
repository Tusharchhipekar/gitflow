export function SequenceDiagramVisual() {
  return (
    <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-xl border border-surface-bright">
      <div className="absolute inset-0 bg-surface-container-lowest opacity-80" />
      <div className="relative z-10 flex h-full w-full items-center justify-center font-mono text-[10px]">
        <div className="absolute left-1/4 top-12 rounded border border-surface-bright bg-surface-container-high p-3 text-on-surface">
          User
        </div>
        <div className="absolute bottom-12 right-1/4 rounded border border-surface-bright bg-surface-container-high p-3 text-on-surface">
          isOdd()
        </div>
        <div className="absolute right-12 top-24 rounded border border-surface-bright bg-surface-container-high p-3 text-on-surface">
          Validation
        </div>
        <svg
          className="absolute inset-0 h-full w-full stroke-current text-surface-bright"
          style={{ strokeWidth: 1 }}
        >
          <path
            d="M 25% 15% L 85% 35%"
            fill="none"
            opacity="0.4"
            strokeDasharray="4 4"
          />
          <path
            d="M 25% 15% L 75% 85%"
            fill="none"
            opacity="0.4"
            strokeDasharray="4 4"
          />
          <path
            d="M 85% 35% L 75% 85%"
            fill="none"
            opacity="0.4"
            strokeDasharray="4 4"
          />
        </svg>
      </div>
    </div>
  );
}