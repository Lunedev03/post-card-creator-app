
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Image } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImageGridProps {
  images: string[];
  onRemoveImage: (index: number) => void;
  onReorderImages?: (newOrder: string[]) => void;
}

const ImageGrid = ({ images, onRemoveImage, onReorderImages }: ImageGridProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [centeringIndex, setCenteringIndex] = useState<number | null>(null);
  const [centerPosition, setCenterPosition] = useState<{ x: number, y: number }[]>(
    images.map(() => ({ x: 50, y: 50 }))
  );
  
  if (images.length === 0) return null;
  
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }
    
    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    // Remove the dragged image
    newImages.splice(draggedIndex, 1);
    
    // Insert it at the new position
    newImages.splice(targetIndex, 0, draggedImage);
    
    // Update center positions to match the new image order
    const newCenterPositions = [...centerPosition];
    const draggedPosition = newCenterPositions[draggedIndex];
    newCenterPositions.splice(draggedIndex, 1);
    newCenterPositions.splice(targetIndex, 0, draggedPosition);
    
    setCenterPosition(newCenterPositions);
    
    if (onReorderImages) {
      onReorderImages(newImages);
    }
    
    setDraggedIndex(null);
  };
  
  const handleDoubleClick = (index: number) => {
    setCenteringIndex(index);
  };

  const handleImageClick = (e: React.MouseEvent, index: number) => {
    if (centeringIndex === index) {
      // Calculate the click position relative to the image dimensions
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Update center position for this image
      const newCenterPositions = [...centerPosition];
      newCenterPositions[index] = { x, y };
      setCenterPosition(newCenterPositions);
      
      // Show confirmation toast
      const event = new CustomEvent('image-centered', { 
        detail: { message: 'Imagem centralizada!' } 
      });
      window.dispatchEvent(event);
    }
  };

  const exitCenteringMode = () => {
    setCenteringIndex(null);
  };
  
  if (images.length === 1) {
    return (
      <div className="relative">
        <div className="mt-3 overflow-hidden rounded-xl">
          <div 
            className={`relative ${centeringIndex === 0 ? 'cursor-crosshair bg-black/5' : ''}`}
            onDoubleClick={() => handleDoubleClick(0)}
            onClick={(e) => handleImageClick(e, 0)}
          >
            <img 
              src={images[0]} 
              alt="Imagem do post" 
              className="w-full h-auto object-cover"
              style={centeringIndex === 0 || centerPosition[0] ? {
                objectPosition: `${centerPosition[0].x}% ${centerPosition[0].y}%`
              } : {}}
            />
            {centeringIndex === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="bg-white p-2 rounded shadow">
                  <p className="text-sm">Clique para centralizar</p>
                  <Button size="sm" onClick={exitCenteringMode}>Concluído</Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm"
            className="p-1 h-8 w-8"
            onClick={() => onRemoveImage(0)}
          >
            <X size={16} />
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="p-1 h-8 w-8"
                  onClick={() => handleDoubleClick(0)}
                >
                  <Image size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Centralizar imagem</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <div className="relative">
        <div className="mt-3 overflow-hidden">
          <div className={`grid gap-1 ${images.length === 2 ? 'grid-cols-2' : images.length === 3 ? 'grid-cols-2' : 'grid-cols-2'}`}>
            {images.map((img, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div 
                    className={`relative overflow-hidden ${
                      images.length === 3 && index === 0 ? 'row-span-2' : ''
                    } ${
                      images.length === 4 ? 'aspect-square' : ''
                    } ${
                      centeringIndex === index 
                        ? 'cursor-crosshair bg-black/5' 
                        : 'cursor-move'
                    } border-2 ${
                      draggedIndex === index 
                        ? 'border-blue-500' 
                        : centeringIndex === index 
                          ? 'border-green-500' 
                          : 'border-transparent'
                    } hover:border-gray-300`}
                    draggable={centeringIndex === null}
                    onDragStart={() => centeringIndex === null && handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    onDoubleClick={() => handleDoubleClick(index)}
                    onClick={(e) => handleImageClick(e, index)}
                  >
                    <img 
                      src={img} 
                      alt={`Imagem ${index + 1} do post`} 
                      className="w-full h-full object-cover rounded-md"
                      style={centerPosition[index] ? {
                        objectPosition: `${centerPosition[index].x}% ${centerPosition[index].y}%`
                      } : {}}
                    />
                    {centeringIndex === index && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="bg-white p-2 rounded shadow">
                          <p className="text-sm">Clique para centralizar</p>
                          <Button size="sm" onClick={exitCenteringMode}>Concluído</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {centeringIndex === index 
                    ? 'Clique para definir o centro da imagem'
                    : 'Arraste para reordenar ou clique duas vezes para centralizar'}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {images.map((_, index) => (
            <React.Fragment key={index}>
              <Button 
                variant="outline" 
                size="sm"
                className="p-1 h-8 w-8"
                onClick={() => onRemoveImage(index)}
              >
                <X size={16} />
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="p-1 h-8 w-8"
                    onClick={() => handleDoubleClick(index)}
                  >
                    <Image size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Centralizar imagem</p>
                </TooltipContent>
              </Tooltip>
            </React.Fragment>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ImageGrid;
