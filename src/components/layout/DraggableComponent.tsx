import React, { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown } from 'lucide-react';

interface DraggableComponentProps {
  children: React.ReactNode;
  initialPosition: { x: number; y: number };
  initialSize: { width: number; height: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  className?: string;
}

// Estilos CSS para o componente arrastável
const draggableStyles = `
  .draggable-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0);
    z-index: 1;
    pointer-events: none;
    transition: background 0.2s ease;
  }
  
  .draggable-container:hover .draggable-overlay {
    background: rgba(0, 0, 0, 0.02);
  }
  
  .draggable-container.cursor-grabbing .draggable-overlay {
    background: rgba(0, 0, 0, 0.05);
  }
`;

// Adicione os estilos ao documento apenas uma vez
if (typeof document !== 'undefined') {
  const styleId = 'draggable-component-styles';
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.innerHTML = draggableStyles;
    document.head.appendChild(styleElement);
  }
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
  const contentRef = useRef<HTMLDivElement>(null);
  const initialMousePosition = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });
  
  // Função simplificada para detectar elementos interativos
  const isInteractiveElement = (target: HTMLElement | null): boolean => {
    if (!target) return false;
    
    const interactiveElements = [
      'BUTTON', 'INPUT', 'A', 'SELECT', 'TEXTAREA'
    ];
    
    return interactiveElements.includes(target.tagName) ||
           target.hasAttribute('role') ||
           target.classList.contains('emoji-button') ||
           !!target.closest('button') ||
           !!target.closest('a') ||
           !!target.closest('input') ||
           !!target.closest('select') ||
           !!target.closest('textarea');
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Verificar se o clique foi no elemento de redimensionamento
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      return;
    }
    
    // Ignorar cliques em elementos interativos
    if (isInteractiveElement(e.target as HTMLElement)) {
      return;
    }
    
    setIsDragging(true);
    initialMousePosition.current = { 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    };
    e.preventDefault();
  };
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Verificar se o toque foi no elemento de redimensionamento
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      return;
    }
    
    // Ignorar toques em elementos interativos
    if (isInteractiveElement(e.target as HTMLElement)) {
      return;
    }
    
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      initialMousePosition.current = { 
        x: touch.clientX - position.x, 
        y: touch.clientY - position.y 
      };
      e.preventDefault();
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
    e.stopPropagation(); // Impedir que o evento se propague
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
      e.preventDefault();
      e.stopPropagation(); // Impedir que o evento se propague
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
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
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
      className={`absolute rounded-md shadow-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 ${className} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} draggable-container`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transition: isDragging || isResizing ? 'none' : 'box-shadow 0.3s ease',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Overlay para feedback visual ao arrastar */}
      <div className="draggable-overlay"></div>
      
      {/* Conteúdo do componente */}
      <div 
        ref={contentRef}
        className="w-full h-full overflow-auto relative"
      >
        {children}
      </div>
      
      {/* Manipulador de redimensionamento */}
      <div 
        className="absolute right-0 bottom-0 w-6 h-6 flex items-center justify-center cursor-se-resize bg-gray-200/60 dark:bg-gray-800/60 hover:bg-gray-300/80 dark:hover:bg-gray-700/80 transition-colors rounded-tl-md z-50 resize-handle"
        onMouseDown={handleResizeStart}
        onTouchStart={handleResizeTouchStart}
      >
        <ChevronsUpDown size={14} className="rotate-45 text-gray-600 dark:text-gray-300" />
      </div>
    </div>
  );
};

export default DraggableComponent;
