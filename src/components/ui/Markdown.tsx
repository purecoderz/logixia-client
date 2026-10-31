import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  children: string;
  /** Lessons can show images. Descriptions can't: a remote image could track the reader. */
  allowImages?: boolean;
  className?: string;
}

/**
 * Renders user-written Markdown. Raw HTML in the text is NOT rendered, which is
 * what makes it safe to show instructor content to students.
 */
export function Markdown({ children, allowImages = false, className = "" }: MarkdownProps) {
  return (
    <div className={`prose prose-invert prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        disallowedElements={allowImages ? [] : ["img"]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}