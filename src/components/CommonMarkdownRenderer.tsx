import React from "react";
import ReactMarkdown from "react-markdown";
import MarkdownCodeBlockRenderer from "./MarkdownCodeBlockRenderer";

interface CommonMarkdownRendererProps {
  content: string;
}

const CommonMarkdownRenderer: React.FC<CommonMarkdownRendererProps> = ({ content }) => (
  <ReactMarkdown
    components={{
      code: MarkdownCodeBlockRenderer,
    }}
  >
    {content}
  </ReactMarkdown>
);

export default CommonMarkdownRenderer;
