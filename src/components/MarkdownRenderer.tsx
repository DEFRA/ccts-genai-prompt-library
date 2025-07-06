import DOMPurify from 'dompurify';
import { marked } from 'marked';

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const parsedContent = marked.parse(content, { async: false });
  const sanitizedHtml = DOMPurify.sanitize(parsedContent, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}; 