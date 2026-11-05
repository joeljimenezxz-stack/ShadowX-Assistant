import React from 'react';
import { marked } from 'marked';
import { CodeBlock } from './CodeBlock';

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  // Split content by code blocks: ```[lang]\n[code]\n```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  let blockCounter = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      const html = marked.parse(textBefore) as string;
      parts.push(
        <div
          key={`text-${blockCounter}`}
          className="prose-shadowx text-[13.5px] leading-relaxed break-words"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    const language = match[1] || 'luau';
    const code = match[2];
    const surroundingContext = textBefore.slice(-300);

    parts.push(
      <CodeBlock
        key={`code-${blockCounter}`}
        language={language}
        code={code}
        surroundingContext={surroundingContext}
      />
    );

    lastIndex = match.index + match[0].length;
    blockCounter++;
  }

  // Remaining text after last code block
  if (lastIndex < content.length) {
    const remainingText = content.substring(lastIndex);
    if (remainingText.trim()) {
      const html = marked.parse(remainingText) as string;
      parts.push(
        <div
          key={`text-final-${blockCounter}`}
          className="prose-shadowx text-[13.5px] leading-relaxed break-words"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
  }

  if (parts.length === 0 && content) {
    const html = marked.parse(content) as string;
    return (
      <div
        className="prose-shadowx text-[13.5px] leading-relaxed break-words"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return <div className="space-y-2">{parts}</div>;
};
