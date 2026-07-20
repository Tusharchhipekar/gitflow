import type { IndexStatus } from "@repo/types";
import { cn } from "@/shared/lib/cn";

const STATUS_PROGRESS: Record<IndexStatus, number> = {
  pending: 0,
  fetching: 20,
  planning: 40,
  generating: 70,
  ready: 100,
  failed: 0,
};

type ProgressProps = {
  status: IndexStatus;
};

export function Progress({ status }: ProgressProps) {
  const percent = STATUS_PROGRESS[status];
  const isFailed = status === "failed";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-label-sm">
        <span className="uppercase tracking-wide text-on-surface-variant">
          Extraction status
        </span>
        <span
          className={cn(
            "font-medium",
            isFailed ? "text-error" : "text-on-surface",
          )}
        >
          {isFailed ? "Failed" : `${percent}%`}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isFailed ? "bg-error" : "bg-primary",
          )}
          style={{ width: isFailed ? "100%" : `${percent}%` }}
        />
      </div>
    </div>
  );
}