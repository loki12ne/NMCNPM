import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  inline?: boolean;
}

const MathRenderer: React.FC<MathRendererProps> = ({ content, inline = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(content, containerRef.current, {
          throwOnError: false,
          displayMode: !inline,
        });
      } catch (error) {
        console.error('Error rendering math expression:', error);
        containerRef.current.textContent = content;
      }
    }
  }, [content, inline]);
  
  return (
    <div 
      ref={containerRef} 
      className={`math-expression ${inline ? 'inline-block' : 'block my-4 text-center'}`}
    />
  );
};

// Process text content to render math expressions
export const processTextWithMath = (text: string): React.ReactNode[] => {
  if (!text) return [];

  // Process x^2 notation to proper formatting
  // This is a simple example - a more robust solution would use proper regex
  let processedText = text.replace(/(\w+)\^(\d+)/g, '$1<sup>$2</sup>');
  
  // Split the text by math delimiters
  const parts = processedText.split(/(\$\$.*?\$\$|\$.*?\$)/gs);
  
  return parts.map((part, index) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      // Display mode math
      const mathContent = part.slice(2, -2);
      return <MathRenderer key={index} content={mathContent} />;
    } else if (part.startsWith('$') && part.endsWith('$')) {
      // Inline math
      const mathContent = part.slice(1, -1);
      return <MathRenderer key={index} content={mathContent} inline />;
    } else {
      // Regular text with superscript support
      return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
    }
  });
};

export default MathRenderer;