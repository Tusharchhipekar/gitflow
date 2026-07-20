export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-md px-lg text-center">
        <span className="font-mono text-label-sm tracking-widest text-on-surface-variant uppercase">
          GitFlow
        </span>
        <h1 className="font-display text-display text-foreground">
          Technical Mono
        </h1>
        <p className="max-w-md font-sans text-body-md text-on-surface-variant">
          Design system tokens are wired up. Start building on{" "}
          <code className="rounded-sm bg-surface-container-high px-1 py-0.5 font-mono text-code-md text-on-surface">
            page.tsx
          </code>
          .
        </p>
      </main>
    </div>
  );
}
