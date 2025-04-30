
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Download, FileImage } from 'lucide-react';
import { exportAsImage } from '@/utils/imageExport';

const PostSimulator = () => {
  const [postText, setPostText] = useState('Digite seu texto aqui...');
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
  };

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.match('image.*')) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          setImage(loadEvent.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          setImage(loadEvent.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    if (postRef.current) {
      exportAsImage(postRef.current, 'meu-post.png');
    }
  };

  return (
    <div className="flex flex-col items-center w-full p-4">
      <Card className="w-full max-w-[500px] overflow-hidden shadow-md rounded-lg mb-4">
        <div
          ref={postRef}
          className="bg-white p-4 flex flex-col"
        >
          <div className="mb-3">
            <Textarea
              value={postText}
              onChange={handleTextChange}
              className="border-none resize-none focus-visible:ring-0 p-0 text-base"
              rows={4}
              placeholder="Digite seu texto aqui..."
            />
          </div>
          
          <div
            className={`mt-2 flex items-center justify-center border-2 border-dashed rounded-lg ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            } ${image ? '' : 'h-40'} overflow-hidden cursor-pointer`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleImageClick}
          >
            {image ? (
              <img 
                src={image} 
                alt="Imagem do post" 
                className="w-full h-auto object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                <FileImage className="h-10 w-10 mb-2" />
                <p>Arraste uma imagem ou clique para selecionar</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Button 
        onClick={handleExport} 
        className="flex gap-2 items-center"
      >
        <Download className="h-4 w-4" />
        Exportar como imagem
      </Button>
    </div>
  );
};

export default PostSimulator;
