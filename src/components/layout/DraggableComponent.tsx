import React, { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown } from 'lucide-react';

interface DraggableComponentProps {
  children: React.ReactNode;
  initialPosition: { x: number; y: number };
  initialSize: { width: number; height: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  preventExitViewport?: boolean;
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
  
  .draggable-header {
    cursor: grab;
    touch-action: none;
    user-select: none;
  }
  
  .draggable-container.cursor-grabbing .draggable-header {
    cursor: grabbing;
  }
  
  @media (max-width: 768px) {
    .draggable-container {
      border-radius: 12px !important;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
    }
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
  minWidth = 200,
  minHeight = 150,
  preventExitViewport = true,
}: DraggableComponentProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  
  const dragRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const initialMousePosition = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });
  
  // Detectar se é dispositivo móvel e atualizar tamanho da viewport
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
      
      // Ajustar tamanho automaticamente para mobile
      if (mobile && onSizeChange) {
        const mobileSize = {
          width: Math.min(window.innerWidth - 30, initialSize.width),
          height: Math.min(window.innerHeight / 2, initialSize.height)
        };
        setSize(mobileSize);
        onSizeChange(mobileSize);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [initialSize, onSizeChange]);
  
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
  
  // Função para restringir a posição dentro da viewport
  const constrainPosition = (pos: { x: number, y: number }) => {
    if (!preventExitViewport) return pos;
    
    const headerHeight = 50; // Altura aproximada do cabeçalho
    
    return {
      x: Math.max(0, Math.min(pos.x, viewportSize.width - size.width)),
      y: Math.max(0, Math.min(pos.y, viewportSize.height - headerHeight))
    };
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Verificar se o clique foi no elemento de redimensionamento
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      return;
    }
    
    // Verificar se o clique foi na área de arrasto (cabeçalho)
    const target = e.target as HTMLElement;
    const isDragHandle = target.classList.contains('draggable-header') || 
                         !!target.closest('.draggable-header');
    
    // Em dispositivos móveis, permitir arrastar apenas pelo cabeçalho
    if (isMobile && !isDragHandle) {
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
    
    // Verificar se o toque foi na área de arrasto (cabeçalho)
    const target = e.target as HTMLElement;
    const isDragHandle = target.classList.contains('draggable-header') || 
                         !!target.closest('.draggable-header');
    
    // Em dispositivos móveis, permitir arrastar apenas pelo cabeçalho
    if (isMobile && !isDragHandle) {
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
        
        // Aplicar restrições de viewport
        const constrainedPosition = constrainPosition(newPosition);
        
        setPosition(constrainedPosition);
        onPositionChange(constrainedPosition);
      }
      
      if (isResizing) {
        const deltaX = e.clientX - initialMousePosition.current.x;
        const deltaY = e.clientY - initialMousePosition.current.y;
        
        const newWidth = Math.max(minWidth, resizeStartSize.current.width + deltaX);
        const newHeight = Math.max(minHeight, resizeStartSize.current.height + deltaY);
        
        // Limitar o tamanho máximo ao tamanho da viewport
        const maxWidth = preventExitViewport ? viewportSize.width - position.x : 2000;
        const maxHeight = preventExitViewport ? viewportSize.height - position.y : 2000;
        
        const constrainedSize = {
          width: Math.min(newWidth, maxWidth),
          height: Math.min(newHeight, maxHeight)
        };
        
        setSize(constrainedSize);
        if (onSizeChange) {
          onSizeChange(constrainedSize);
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
          
          // Aplicar restrições de viewport
          const constrainedPosition = constrainPosition(newPosition);
          
          setPosition(constrainedPosition);
          onPositionChange(constrainedPosition);
        }
        
        if (isResizing) {
          const deltaX = touch.clientX - initialMousePosition.current.x;
          const deltaY = touch.clientY - initialMousePosition.current.y;
          
          const newWidth = Math.max(minWidth, resizeStartSize.current.width + deltaX);
          const newHeight = Math.max(minHeight, resizeStartSize.current.height + deltaY);
          
          // Limitar o tamanho máximo ao tamanho da viewport
          const maxWidth = preventExitViewport ? viewportSize.width - position.x : 2000;
          const maxHeight = preventExitViewport ? viewportSize.height - position.y : 2000;
          
          const constrainedSize = {
            width: Math.min(newWidth, maxWidth),
            height: Math.min(newHeight, maxHeight)
          };
          
          setSize(constrainedSize);
          if (onSizeChange) {
            onSizeChange(constrainedSize);
          }
        }
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    
    // Adicionar event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleMouseUp);
    
    // Limpar
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isResizing, position, size, minWidth, minHeight, onPositionChange, onSizeChange, viewportSize, preventExitViewport]);
  
  // Adicionar feedback de resposta no mobile (vibração)
  useEffect(() => {
    if (isDragging && isMobile && 'vibrate' in navigator) {
      navigator.vibrate(10); // Vibração curta para feedback tátil
    }
  }, [isDragging, isMobile]);
  
  return (
    <div
      ref={dragRef}
      className={`absolute rounded-md shadow-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 ${className} ${isDragging ? 'cursor-grabbing' : ''} draggable-container`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transition: isDragging || isResizing ? 'none' : 'box-shadow 0.3s ease',
        zIndex: isDragging || isResizing ? 100 : 10,
      }}
    >
      {/* Overlay para feedback visual ao arrastar */}
      <div className="draggable-overlay"></div>
      
      {/* Cabeçalho para arrastar */}
      <div 
        className="draggable-header flex items-center justify-center h-8 bg-gray-100 dark:bg-gray-900 rounded-t-md border-b border-gray-200 dark:border-gray-800"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="w-16 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      </div>
      
      {/* Conteúdo do componente */}
      <div 
        ref={contentRef}
        className="w-full h-[calc(100%-2rem)] overflow-auto"
      >
        {children}
      </div>
      
      {/* Alça de redimensionamento (apenas visível em desktop) */}
      {!isMobile && (
        <div
          className="resize-handle absolute bottom-1 right-1 w-6 h-6 flex items-center justify-center cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeTouchStart}
        >
          <ChevronsUpDown className="transform rotate-45" size={16} />
        </div>
      )}
    </div>
  );
};

export default DraggableComponent;
