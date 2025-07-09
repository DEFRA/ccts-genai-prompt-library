import React from "react";
import { Copy, Download } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { copyToClipboard } from "../utils/clipboard";
import { detectFileDetails, downloadCode } from "../utils/codeUtils";

interface CodeBlockProps {
  inline: boolean;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className ?? "");
  if (!inline && match) {
    const codeContent = String(children).replace(/\n$/, "");
    const { fileName } = detectFileDetails(codeContent);
    return (
      <div className="relative">
        <div className="absolute right-2 top-2 flex gap-2">
          <button
            onClick={() => copyToClipboard(codeContent)}
            className="p-1.5 bg-vscode-button/20 text-vscode-button-fg rounded-sm hover:bg-vscode-button/30"
            title="Copy code"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => downloadCode(codeContent, fileName)}
            className="p-1.5 bg-vscode-button/20 text-vscode-button-fg rounded-sm hover:bg-vscode-button/30"
            title="Download code"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
        <SyntaxHighlighter
          language={match[1]}
          style={tomorrow}
          PreTag="div"
          customStyle={{
            margin: 0,
            backgroundColor: "var(--vscode-editor-background)",
            padding: "1rem",
          }}
          {...props}
        >
          {codeContent}
        </SyntaxHighlighter>
      </div>
    );
  }
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

export default CodeBlock;
