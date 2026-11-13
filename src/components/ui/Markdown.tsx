// src/components/MarkdownRenderer.tsx
import {
  type ComponentPropsWithoutRef,
  useContext,
  createContext,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/features/theme/ThemeProvider";

interface Props {
  content: string;
}

const PreContext = createContext(false);

interface CodeProps extends ComponentPropsWithoutRef<"code"> {
  className?: string;
}

function MarkdownImage({
  src,
  alt,
  ...props
}: ComponentPropsWithoutRef<"img">) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="my-4 rounded-md border border-line bg-input p-4 text-center text-muted">
        <span className="text-sm">Failed to load image</span>
        {alt && <span className="mt-1 block text-xs text-muted">{alt}</span>}
      </div>
    );
  }

  return (
    <>
      <figure className="my-4">
        <div
          className="group relative cursor-zoom-in overflow-hidden rounded-md border border-line bg-input"
          onClick={() => setIsExpanded(true)}
        >
          <img
            src={src}
            alt={alt || ""}
            loading="lazy"
            className="h-auto max-h-[400px] w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
            onError={() => setHasError(true)}
            {...props}
          />
        </div>
        {alt && (
          <figcaption className="mt-2 text-center text-xs text-muted">
            {alt}
          </figcaption>
        )}
      </figure>

      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        >
          <img
            src={src}
            alt={alt || ""}
            className="max-h-full max-w-full rounded-md object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
}

export function MarkdownRenderer({ content }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="prose prose-sm max-w-none
      text-body
      prose-headings:font-semibold prose-headings:text-foreground
      prose-h1:mb-4 prose-h1:border-b prose-h1:border-line prose-h1:pb-2 prose-h1:text-xl
      prose-h2:mb-3 prose-h2:border-b prose-h2:border-line prose-h2:pb-1.5 prose-h2:text-lg
      prose-h3:mb-2 prose-h3:text-sm
      prose-h4:text-sm
      prose-p:mb-3.5 prose-p:leading-relaxed prose-p:text-body
      prose-a:text-accent prose-a:no-underline hover:prose-a:underline
      prose-strong:font-semibold prose-strong:text-foreground
      prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5
      prose-li:text-body prose-li:marker:text-muted
      prose-blockquote:border-l-4 prose-blockquote:border-line-strong
      prose-blockquote:bg-input prose-blockquote:py-1 prose-blockquote:pl-4
      prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-muted
      prose-table:w-full prose-table:border-collapse
      prose-th:border prose-th:border-line prose-th:bg-input prose-th:p-2 prose-th:text-left prose-th:font-semibold prose-th:text-foreground
      prose-td:border prose-td:border-line prose-td:p-2 prose-td:text-body
      prose-hr:my-6 prose-hr:border-line
      prose-code:before:content-none prose-code:after:content-none
      prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: MarkdownImage as any,

          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },

          pre: ({ children }) => (
            <PreContext.Provider value={true}>
              <pre className="m-0 bg-transparent p-0">{children}</pre>
            </PreContext.Provider>
          ),

          code: ({ className, children, ...props }: CodeProps) => {
            const isBlock = useContext(PreContext);
            const match = /language-(\w+)/.exec(className || "");

            // 1. Code Blocks (Fenced with language)
            if (isBlock && match) {
              return (
                <div className="my-3 overflow-hidden rounded-lg border border-line bg-input">
                  <div className="flex items-center justify-between border-b border-line bg-surface/60 px-3 py-1.5 text-xs text-muted">
                    <span className="font-mono lowercase">{match[1]}</span>
                  </div>
                  <SyntaxHighlighter
                    style={(isDark ? vscDarkPlus : vs) as any}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: "0.875rem 1rem",
                      background: "transparent",
                      fontSize: "0.8125rem",
                    }}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              );
            }

            // 2. Code Blocks (Without language)
            if (isBlock) {
              return (
                <pre className="my-3 overflow-x-auto rounded-lg border border-line bg-input p-3.5">
                  <code
                    className="font-mono text-xs leading-relaxed text-foreground"
                    {...props}
                  >
                    {children}
                  </code>
                </pre>
              );
            }

            // 3. Inline Code
            return (
              <code
                className="rounded border border-line bg-input px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-accent"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
