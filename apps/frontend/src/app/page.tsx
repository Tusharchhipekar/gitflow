import { Sparkles, GitBranch } from "lucide-react";
import { LandingNav } from "@/features/landing/components/LandingNav";
import { Hero } from "@/features/landing/components/Hero";
import { FeatureSection } from "@/features/landing/components/FeatureSection";
import { DocGenerationVisual } from "@/features/landing/components/DocGenerationVisual";
import { SequenceDiagramVisual } from "@/features/landing/components/SequenceDiagramVisual";
import { FinalCta } from "@/features/landing/components/FinalCta";
import { LandingFooter } from "@/features/landing/components/LandingFooter";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body text-on-surface antialiased">
      <LandingNav />
      <main className="w-full flex-1">
        <Hero />

        <div className="mx-auto h-px w-full max-w-7xl bg-surface-bright" />

        <div id="features">
          <FeatureSection
            icon={Sparkles}
            title="AI-Generated Documentation"
            description="GitFlow reads your repository's actual source files and generates structured documentation with an AI model — organized into sections and pages you can browse and search."
            bullets={[
              "Real source code, not just README parsing",
              "Organized into sections and pages automatically",
              "Works with any text-based source language",
            ]}
            visual={<DocGenerationVisual />}
          />
        </div>

        <div className="mx-auto h-px w-full max-w-7xl bg-surface-bright" />

        <FeatureSection
          icon={GitBranch}
          title="Real Sequence Diagrams"
          description="Every generated page includes a Mermaid sequence diagram showing the actual call flow found in your code — grounded in the real functions, services, and modules it read."
          reverse
          visual={<SequenceDiagramVisual />}
        />

        <div className="mx-auto h-px w-full max-w-7xl bg-surface-bright" />

        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}