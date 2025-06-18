import React from "react";
import CommonMarkdownRenderer from "./CommonMarkdownRenderer";

interface ChatMarkdownProps {
  llmResponse: string | null;
}

const ChatMarkdown: React.FC<ChatMarkdownProps> = ({ llmResponse }) => (
  <CommonMarkdownRenderer content={llmResponse ?? ""} />
);

export default ChatMarkdown;
