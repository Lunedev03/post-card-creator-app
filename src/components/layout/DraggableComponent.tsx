
import React, { useState, useRef, useEffect } from 'react';
import { Move, ChevronsUpDown } from 'lucide-react';

interface DraggableComponentProps {
  children: React.ReactNode;
  initialPosition: { x: number; y: number };
  initialSize: { width: number; height: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  className?: string;
}

const DraggableComponent = ({
  children,
  initialPosition,
  initialSize = { width: 300, height: 400 },
  onPositionChange,
  onSizeChange,
  className = '',
}: DraggableComponentProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const dragRef = useRef<HTMLDivElement>(null);
  const initialMousePosition = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    initialMousePosition.current = { 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    };
    e.preventDefault();
  };
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      initialMousePosition.current = { 
        x: touch.clientX - position.x, 
        y: touch.clientY - position.y 
      };
    }
  };

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsResizing(true);
    initialMousePosition.current = { x: e.clientX, y: e.clientY };
    resizeStartSize.current = { 
      width: size.width,
      height: size.height
    };
    e.preventDefault();
  };

  const handleResizeTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsResizing(true);
      const touch = e.touches[0];
      initialMousePosition.current = { x: touch.clientX, y: touch.clientY };
      resizeStartSize.current = { 
        width: size.width,
        height: size.height
      };
    }
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = { 
          x: e.clientX - initialMousePosition.current.x,
          y: e.clientY - initialMousePosition.current.y
        };
        setPosition(newPosition);
        onPositionChange(newPosition);
      }
      if (isResizing) {
        const deltaX = e.clientX - initialMousePosition.current.x;
        const deltaY = e.clientY - initialMousePosition.current.y;
        
        const newWidth = Math.max(200, resizeStartSize.current.width + deltaX);
        const newHeight = Math.max(150, resizeStartSize.current.height + deltaY);
        
        const newSize = { 
          width: newWidth, 
          height: newHeight 
        };
        
        setSize(newSize);
        if (onSizeChange) {
          onSizeChange(newSize);
        }
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if ((isDragging || isResizing) && e.touches.length === 1) {
        const touch = e.touches[0];
        
        if (isDragging) {
          const newPosition = { 
            x: touch.clientX - initialMousePosition.current.x,
            y: touch.clientY - initialMousePosition.current.y
          };
          setPosition(newPosition);
          onPositionChange(newPosition);
        }
        
        if (isResizing) {
          const deltaX = touch.clientX - initialMousePosition.current.x;
          const deltaY = touch.clientY - initialMousePosition.current.y;
          
          const newWidth = Math.max(200, resizeStartSize.current.width + deltaX);
          const newHeight = Math.max(150, resizeStartSize.current.height + deltaY);
          
          const newSize = { 
            width: newWidth, 
            height: newHeight 
          };
          
          setSize(newSize);
          if (onSizeChange) {
            onSizeChange(newSize);
          }
        }
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleMouseUp);
    
    // Clean up
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isResizing, onPositionChange, onSizeChange]);
  
  return (
    <div
      ref={dragRef}
      className={`absolute ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: isDragging ? 'grabbing' : 'auto',
        transition: isDragging || isResizing ? 'none' : 'box-shadow 0.3s ease',
      }}
    >
      <div 
        className="bg-blue-500 text-white p-1 rounded-t-md flex items-center justify-between cursor-grab"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="text-xs font-medium ml-2">Arraste aqui</div>
        <Move size={16} className="mr-2" />
      </div>
      <div className="overflow-auto h-[calc(100%-28px)]">{children}</div>
      <div 
        className="absolute bottom-0 right-0 w-6 h-6 flex items-center justify-center cursor-se-resize bg-blue-500 rounded-tl-md"
        onMouseDown={handleResizeStart}
        onTouchStart={handleResizeTouchStart}
      >
        <ChevronsUpDown size={14} className="rotate-45 text-white" />
      </div>
    </div>
  );
};

export default DraggableComponent;
