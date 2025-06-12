import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface OutputDisplayProps {
  displayText: string;
  isTyping: boolean;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ 
  displayText, 
  isTyping,
}) => {
  return (
    <div className="prose prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {displayText || 'No output yet...'}
      </ReactMarkdown>
      {isTyping && <span className="animate-pulse">▌</span>}
      
    </div>
  );
};