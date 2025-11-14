'use client';

import { useState, useRef, useEffect } from 'react';

type ResizableDividerProps = {
  direction: 'horizontal' | 'vertical';
  onResize: (size: number) => void;
  containerRef?: React.RefObject<HTMLElement>;
  minSize?: number;
  maxSize?: number;
};

export function ResizableDivider({ 
  direction, 
  onResize, 
  containerRef,
  minSize = 100,
  maxSize = Infinity 
}: ResizableDividerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dividerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<number>(0);
  const startSizeRef = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    if (direction === 'horizontal') {
      startPosRef.current = e.clientX;
    } else {
      startPosRef.current = e.clientY;
    }
    
    // Get initial size from the divider's previous sibling (the panel being resized)
    if (dividerRef.current?.previousElementSibling) {
      const panel = dividerRef.current.previousElementSibling as HTMLElement;
      if (direction === 'horizontal') {
        startSizeRef.current = panel.clientWidth;
      } else {
        startSizeRef.current = panel.clientHeight;
      }
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      let delta: number;
      
      if (direction === 'horizontal') {
        // Horizontal divider (vertical resize) - resize width
        delta = e.clientX - startPosRef.current;
      } else {
        // Vertical divider (horizontal resize) - resize height
        delta = e.clientY - startPosRef.current;
      }

      const newSize = startSizeRef.current + delta;
      
      // Clamp to min/max
      const clampedSize = Math.max(minSize, Math.min(maxSize, newSize));
      
      onResize(clampedSize);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, direction, minSize, maxSize, onResize]);

  const dividerStyle = direction === 'horizontal' 
    ? { 
        cursor: 'col-resize', 
        width: '4px',
        userSelect: 'none' as const
      }
    : { 
        cursor: 'row-resize', 
        height: '4px',
        width: '100%',
        userSelect: 'none' as const
      };

  return (
    <div
      ref={dividerRef}
      className={`bg-gray-300 hover:bg-blue-500 transition-colors select-none ${
        isDragging ? 'bg-blue-600' : ''
      }`}
      style={dividerStyle}
      onMouseDown={handleMouseDown}
    />
  );
}

