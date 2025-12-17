import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // A very basic parser for the demo. In a real app, use react-markdown.
  // This handles bold, headers, and lists for basic formatting.
  
  const processLine = (line: string, index: number) => {
    // Headers
    if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-bold text-sky-400 mt-4 mb-2">{line.replace('### ', '')}</h3>;
    if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-bold text-sky-300 mt-5 mb-2">{line.replace('## ', '')}</h2>;
    if (line.startsWith('**Probability Summary**')) return <div key={index} className="text-emerald-400 font-bold text-lg mt-4 mb-2">{line.replace(/\*\*/g, '')}</div>;
    
    // Bold
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const parsedLine = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-slate-100">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    // List items
    if (line.trim().startsWith('- ')) {
      return <li key={index} className="ml-4 list-disc marker:text-slate-500 pl-1 mb-1">{parsedLine.slice(1)}</li>;
    }
    
    // Empty lines
    if (!line.trim()) return <div key={index} className="h-2" />;

    return <p key={index} className="mb-1 leading-relaxed text-slate-300">{parsedLine}</p>;
  };

  return (
    <div className="prose prose-invert max-w-none text-sm md:text-base">
      {content.split('\n').map((line, idx) => processLine(line, idx))}
    </div>
  );
};
