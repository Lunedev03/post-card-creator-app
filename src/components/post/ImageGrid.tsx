
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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
    
    if (onReorderImages) {
      onReorderImages(newImages);
    }
    
    setDraggedIndex(null);
  };
  
  if (images.length === 1) {
    return (
      <div className="relative">
        <div className="mt-3 overflow-hidden rounded-xl">
          <img 
            src={images[0]} 
            alt="Imagem do post" 
            className="w-full h-auto object-cover"
          />
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
                    } cursor-move border-2 ${draggedIndex === index ? 'border-blue-500' : 'border-transparent'} hover:border-gray-300`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                  >
                    <img 
                      src={img} 
                      alt={`Imagem ${index + 1} do post`} 
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Arraste para reordenar</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {images.map((_, index) => (
            <Button 
              key={index} 
              variant="outline" 
              size="sm"
              className="p-1 h-8 w-8"
              onClick={() => onRemoveImage(index)}
            >
              <X size={16} />
            </Button>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ImageGrid;
