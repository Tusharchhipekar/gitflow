export function DocGenerationVisual() {
  return (
    <div className="rounded-xl border border-surface-bright p-1">
      <div className="flex h-80 flex-col justify-center gap-4 rounded-lg border border-surface-bright bg-surface-container-lowest p-8">
        <div className="flex items-center justify-between rounded-lg border border-surface-bright bg-surface-container-lowest p-4">
          <span className="font-mono text-xs text-on-surface-variant">
            /src/index.js
          </span>
          <span className="rounded bg-surface-bright px-2 font-mono text-[10px] text-on-surface">
            planning
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-surface-bright bg-surface-container-lowest p-4">
          <span className="font-mono text-xs text-on-surface-variant">
            /src/utils/parser.js
          </span>
          <span className="rounded bg-surface-bright px-2 font-mono text-[10px] text-on-surface">
            generating
          </span>
        </div>
      </div>
    </div>
  );
}