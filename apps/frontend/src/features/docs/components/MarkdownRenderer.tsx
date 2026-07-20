import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { MermaidBlock } from "./MermaidBlock";


const components: Components = {
  h1: ({ children, ...props }) => (
    <h1
      className="mb-4  text-headline-lg font-display font-bold text-on-surface first:mt-0"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="mb-3 mt-8 text-headline-md font-display font-semibold text-on-surface"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mb-2 mt-6 text-body-lg font-semibold text-on-surface"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-body-md leading-relaxed text-on-surface-variant">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 ml-6 list-disc text-body-md text-on-surface-variant">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-6 list-decimal text-body-md text-on-surface-variant">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="mb-1">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-on-surface underline underline-offset-2 hover:text-primary"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-on-surface">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-2 border-outline-variant pl-4 text-on-surface-variant italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-body-md">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-outline-variant bg-surface-container-high px-3 py-2 text-left font-semibold text-on-surface">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-outline-variant px-3 py-2 text-on-surface-variant">
      {children}
    </td>
  ),
  code(props) {
    const { className, children, ...rest } = props;
    const match = /language-(\w+)/.exec(className || "");

    // A mermaid fenced block gets rendered as an actual diagram, not raw text
    if (match?.[1] === "mermaid") {
      return <MermaidBlock chart={String(children).trim()} />;
    }

    // Inline code (no language, no surrounding <pre>)
    if (!match) {
      return (
        <code
          className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-[0.9em] text-on-surface"
          {...rest}
        >
          {children}
        </code>
      );
    }

    // Fenced code block with a language, but not mermaid
    return (
      <code className={`font-mono text-body-md ${className ?? ""}`} {...rest}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded border border-outline-variant bg-surface-container-lowest p-4">
      {children}
    </pre>
  ),
};

type MarkdownRendererProps = {
  markdown: string;
};

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      components={components}
    >
      {markdown}
    </ReactMarkdown>
  );
}