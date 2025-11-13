'use client';

import React from 'react';

export function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) return text;
  
  const before = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length);
  
  return (
    <>
      {before}
      <span className="bg-yellow-300 font-semibold">{match}</span>
      {after}
    </>
  );
}

export function highlightTextMultiple(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let index = lowerText.indexOf(lowerQuery, lastIndex);
  
  while (index !== -1) {
    // Add text before match
    if (index > lastIndex) {
      parts.push(text.substring(lastIndex, index));
    }
    
    // Add highlighted match
    parts.push(
      <span key={index} className="bg-yellow-300 font-semibold">
        {text.substring(index, index + query.length)}
      </span>
    );
    
    lastIndex = index + query.length;
    index = lowerText.indexOf(lowerQuery, lastIndex);
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return <>{parts}</>;
}

