
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ImageGridProps {
  images: string[];
  onRemoveImage: (index: number) => void;
}

const ImageGrid = ({ images, onRemoveImage }: ImageGridProps) => {
  if (images.length === 0) return null;
  
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
    <div className="relative">
      <div className="mt-3 overflow-hidden">
        <div className={`grid gap-1 ${images.length === 2 ? 'grid-cols-2' : images.length === 3 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {images.map((img, index) => (
            <div key={index} className={`relative overflow-hidden ${
              images.length === 3 && index === 0 ? 'row-span-2' : ''
            } ${
              images.length === 4 ? 'aspect-square' : ''
            }`}>
              <img 
                src={img} 
                alt={`Imagem ${index + 1} do post`} 
                className="w-full h-full object-cover rounded-md"
              />
            </div>
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
  );
};

export default ImageGrid;
