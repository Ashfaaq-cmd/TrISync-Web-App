import ReactMarkdown from "react-markdown"
//Lesson text styled here
export default function MarkdownContent({ children }:{ children: string} ){
return(
    <ReactMarkdown components={{
        h2: ({ children }) => (
          <h2 className="mb-2 mt-6 text-lg font-bold text-foreground">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 mt-4 font-semibold text-foreground">{children}</h3>
        ),
        p: ({ children }) => <p className="mb-3 text-foreground">{children}</p>,
        ul: ({ children }) => (
          <ul className="mb-3 list-disc space-y-1 pl-6 text-foreground">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3 list-decimal space-y-1 pl-6 text-foreground">{children}</ol>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        em: ({ children }) => <em className="text-muted">{children}</em>,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link underline"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mb-3 border-l-4 border-border pl-4 text-muted">
            {children}
          </blockquote>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
)
}