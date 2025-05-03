
import React, { useState, useRef, useEffect } from 'react';
import { Move } from 'lucide-react';

interface DraggableComponentProps {
  children: React.ReactNode;
  initialPosition: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  className?: string;
}

const DraggableComponent = ({
  children,
  initialPosition,
  onPositionChange,
  className = '',
}: DraggableComponentProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const dragRef = useRef<HTMLDivElement>(null);
  const initialMousePosition = useRef({ x: 0, y: 0 });
  
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
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const touch = e.touches[0];
        const newPosition = { 
          x: touch.clientX - initialMousePosition.current.x,
          y: touch.clientY - initialMousePosition.current.y
        };
        setPosition(newPosition);
        onPositionChange(newPosition);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
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
  }, [isDragging, onPositionChange]);
  
  return (
    <div
      ref={dragRef}
      className={`absolute ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'auto',
        transition: isDragging ? 'none' : 'box-shadow 0.3s ease',
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
      {children}
    </div>
  );
};

export default DraggableComponent;
