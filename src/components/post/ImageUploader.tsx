
import React, { useState } from 'react';
import { FileImage } from 'lucide-react';

interface ImageUploaderProps {
  onImagesAdded: (newImages: string[]) => void;
}

const ImageUploader = ({ onImagesAdded }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        processFiles(target.files);
      }
    };
    input.click();
  };

  const processFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
      if (file.type.match('image.*')) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          if (loadEvent.target?.result) {
            onImagesAdded([loadEvent.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  return (
    <div
      className={`flex items-center justify-center border-2 border-dashed rounded-lg ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      } h-40 overflow-hidden cursor-pointer`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleImageUpload}
    >
      <div className="flex flex-col items-center justify-center py-6 text-gray-500">
        <FileImage className="h-10 w-10 mb-2" />
        <p>Clique para fazer upload ou arraste e solte</p>
        <p className="text-xs text-gray-400">PNG, JPG, GIF (máximo 4 imagens)</p>
      </div>
    </div>
  );
};

export default ImageUploader;
