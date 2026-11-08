// src/components/MarkdownRenderer.tsx
import { type ComponentPropsWithoutRef, useContext, createContext, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'; 
import { useTheme } from '@/features/theme/ThemeProvider';

interface Props {
  content: string;
}

const PreContext = createContext(false);

interface CodeProps extends ComponentPropsWithoutRef<'code'> {
  className?: string;
}

function MarkdownImage({ src, alt, ...props }: ComponentPropsWithoutRef<'img'>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="my-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md text-center text-slate-500">
        <span className="text-sm">Failed to load image</span>
        {alt && <span className="block text-xs mt-1 text-slate-400">{alt}</span>}
      </div>
    );
  }

  return (
    <>
      <figure className="my-4">
        <div 
          className="relative group cursor-zoom-in overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
          onClick={() => setIsExpanded(true)}
        >
          <img
            src={src}
            alt={alt || ''}
            loading="lazy"
            className="w-full h-auto max-h-[400px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
            onError={() => setHasError(true)}
            {...props}
          />
        </div>
        {alt && (
          <figcaption className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            {alt}
          </figcaption>
        )}
      </figure>

      {isExpanded && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setIsExpanded(false)}
        >
          <img
            src={src}
            alt={alt || ''}
            className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
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
    <div className="prose prose-sm max-w-none 
      text-slate-800 dark:text-slate-300 
      prose-headings:text-slate-900 dark:prose-headings:text-slate-100 
      prose-headings:font-semibold
      prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base
      prose-h1:mb-4 prose-h2:mb-3 prose-h3:mb-2
      prose-h1:border-b prose-h1:border-slate-200 dark:prose-h1:border-slate-700 prose-h1:pb-2
      prose-h2:border-b prose-h2:border-slate-200 dark:prose-h2:border-slate-700 prose-h2:pb-1
      prose-p:leading-relaxed prose-p:mb-4
      prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-strong:font-semibold
      prose-ul:list-disc prose-ol:list-decimal prose-ul:pl-5 prose-ol:pl-5
      prose-li:marker:text-slate-400 dark:prose-li:marker:text-slate-500
      prose-blockquote:border-l-4 prose-blockquote:border-slate-300 dark:prose-blockquote:border-slate-600 
      prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800/30 prose-blockquote:pl-4 prose-blockquote:py-1 
      prose-blockquote:text-slate-500 dark:prose-blockquote:text-slate-400 prose-blockquote:font-normal prose-blockquote:not-italic
      prose-table:border-collapse prose-table:w-full
      prose-th:bg-slate-50 dark:prose-th:bg-slate-800/50 prose-th:border prose-th:border-slate-200 dark:prose-th:border-slate-700 prose-th:p-2 prose-th:text-left prose-th:font-semibold
      prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-700 prose-td:p-2
      prose-hr:border-slate-200 dark:prose-hr:border-slate-700 prose-hr:my-6
      prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: MarkdownImage as any,

          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith('http');
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
              <pre className="bg-transparent p-0 m-0">{children}</pre>
            </PreContext.Provider>
          ),
          
          code: ({ className, children, ...props }: CodeProps) => {
            const isBlock = useContext(PreContext);
            const match = /language-(\w+)/.exec(className || '');
            
            // 1. Code Blocks (Fenced with language)
            if (isBlock && match) {
              return (
                <div className="my-4 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e1e1e] shadow-sm">
                  <div className="bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <span className="font-mono lowercase">{match[1]}</span>
                  </div>
                  <SyntaxHighlighter
                    style={(isDark ? vscDarkPlus : vs) as any}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '0.875rem' }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              );
            }
            
            // 2. Code Blocks (Without language)
            if (isBlock) {
              return (
                <pre className="my-4 p-4 rounded-md overflow-x-auto bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <code className="text-slate-800 dark:text-slate-200 text-sm font-mono" {...props}>
                    {children}
                  </code>
                </pre>
              );
            }
            
            // 3. Inline Code (e.g. `HELLO WORLD`)
            return (
              <code 
                className="bg-black/5 dark:bg-white/10 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-md text-[0.875em] font-mono border border-black/10 dark:border-white/10" 
                {...props}
              >
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}