
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, FileImage, Save } from 'lucide-react';
import { exportAsImage } from '@/utils/imageExport';
import { usePostHistory } from '@/contexts/PostHistoryContext';
import { useToast } from '@/hooks/use-toast';
import PostTextInput from './PostTextInput';
import ImageGrid from './ImageGrid';
import ImageUploader from './ImageUploader';

const PostSimulator = () => {
  const [postText, setPostText] = useState('O que você está pensando?');
  const [images, setImages] = useState<string[]>([]);
  const postRef = useRef<HTMLDivElement>(null);
  const { addPost } = usePostHistory();
  const { toast } = useToast();

  const handleTextChange = (text: string) => {
    setPostText(text);
  };

  const addImages = (newImages: string[]) => {
    // Limit to 4 images max
    setImages(prev => {
      const combined = [...prev, ...newImages];
      return combined.slice(0, 4);
    });
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const handleExport = () => {
    if (postRef.current) {
      exportAsImage(postRef.current, 'meu-post.png');
    }
  };

  const handleSaveToHistory = () => {
    if (postText !== 'O que você está pensando?') {
      addPost({
        text: postText,
        images: images.length > 0 ? images : undefined,
      });
      
      toast({
        title: "Post salvo!",
        description: "O post foi salvo no seu histórico.",
      });
    } else {
      toast({
        title: "Erro ao salvar",
        description: "Adicione algum texto antes de salvar.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const files = Array.from(target.files);
        
        files.forEach(file => {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            if (loadEvent.target?.result) {
              addImages([loadEvent.target.result as string]);
            }
          };
          reader.readAsDataURL(file);
        });
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-col items-center w-full p-4">
      <Card className="w-full max-w-[500px] overflow-hidden shadow-md rounded-lg mb-6 bg-white">
        <div
          ref={postRef}
          className="p-4 flex flex-col"
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#ffffff'
          }}
        >
          <PostTextInput value={postText} onChange={handleTextChange} />
          
          {images.length > 0 ? (
            <ImageGrid images={images} onRemoveImage={removeImage} />
          ) : (
            <ImageUploader onImagesAdded={addImages} />
          )}
        </div>
      </Card>

      <div className="flex gap-2 w-full max-w-[500px] justify-center">
        <Button 
          onClick={handleExport} 
          className="flex gap-2 items-center bg-blue-500 hover:bg-blue-600 flex-1"
        >
          <Download className="h-4 w-4" />
          Exportar como imagem
        </Button>
        
        <Button 
          onClick={handleSaveToHistory}
          variant="outline" 
          className="flex gap-2 items-center border-blue-500 text-blue-500 hover:bg-blue-50"
        >
          <Save className="h-4 w-4" />
          Salvar no histórico
        </Button>
      </div>
      
      {images.length > 0 && (
        <Button 
          onClick={handleImageUpload}
          variant="outline" 
          className="mt-4 flex gap-2 items-center border-blue-500 text-blue-500 hover:bg-blue-50"
        >
          <FileImage className="h-4 w-4" />
          Adicionar mais imagens {images.length}/4
        </Button>
      )}
    </div>
  );
};

export default PostSimulator;
