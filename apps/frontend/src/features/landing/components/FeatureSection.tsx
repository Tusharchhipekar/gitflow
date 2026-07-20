import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type FeatureSectionProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets?: string[];
  ctaLabel?: string;
  ctaHref?: string;
  reverse?: boolean;
  visual: ReactNode;
};

export function FeatureSection({
  icon: Icon,
  title,
  description,
  bullets,
  reverse = false,
  visual,
}: FeatureSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-32">
      <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
        <div
          className={`flex flex-col gap-8 ${reverse ? "order-1 lg:order-2" : ""}`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-surface-bright bg-surface-container">
            <Icon size={28} className="text-on-surface" />
          </div>
          <h2 className="text-4xl font-extrabold uppercase tracking-tighter text-on-surface">
            {title}
          </h2>
          <p className="leading-relaxed text-on-surface-variant">
            {description}
          </p>
          {bullets && (
            <div className="space-y-4">
              {bullets.map((bullet, i) => (
                <div
                  key={bullet}
                  className="flex items-center gap-4 border-l border-surface-bright pl-4 text-[10px] font-bold uppercase tracking-[0.2em]"
                >
                  <span className="text-on-surface">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {bullet}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={reverse ? "order-2 lg:order-1" : ""}>{visual}</div>
      </div>
    </section>
  );
}