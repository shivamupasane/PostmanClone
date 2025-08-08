import { useMemo } from "react";

interface SyntaxHighlighterProps {
  code: string;
  language: "json" | "xml" | "html" | "javascript";
}

export function SyntaxHighlighter({ code, language }: SyntaxHighlighterProps) {
  const highlightedCode = useMemo(() => {
    if (language === "json") {
      return highlightJson(code);
    }
    return code;
  }, [code, language]);

  return (
    <div className="syntax-highlight overflow-auto">
      <pre 
        className="text-sm"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </div>
  );
}

function highlightJson(json: string): string {
  // Simple JSON syntax highlighting
  return json
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
    .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
    .replace(/: (null)/g, ': <span class="json-boolean">$1</span>');
}
