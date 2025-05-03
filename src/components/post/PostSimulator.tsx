
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
      <Card className="w-full max-w-[500px] overflow-hidden shadow-sm rounded-lg mb-6 bg-white dark:bg-gray-950">
        <div
          ref={postRef}
          className="p-4 flex flex-col"
        >
          <PostTextInput value={postText} onChange={handleTextChange} />
          
          {images.length > 0 ? (
            <ImageGrid images={images} onRemoveImage={removeImage} />
          ) : (
            <div 
              className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-all mt-2"
              onClick={handleImageUpload}
            >
              <FileImage className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-center text-gray-500 dark:text-gray-400">
                Clique para fazer upload ou arraste e solte
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                PNG, JPG, GIF (máximo 4 imagens)
              </p>
            </div>
          )}
        </div>
      </Card>

      <div className="flex w-full max-w-[500px] gap-2">
        <Button 
          onClick={handleExport} 
          className="flex-1 bg-blue-500 hover:bg-blue-600"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar como imagem
        </Button>
        
        <Button 
          onClick={handleSaveToHistory}
          variant="outline" 
          className="flex-1 border-blue-500 text-blue-500"
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar no histórico
        </Button>
      </div>
      
      {images.length > 0 && (
        <Button 
          onClick={handleImageUpload}
          variant="outline" 
          className="mt-4 w-full max-w-[500px] border-blue-500 text-blue-500"
        >
          <FileImage className="h-4 w-4 mr-2" />
          Adicionar mais imagens {images.length}/4
        </Button>
      )}
    </div>
  );
};

export default PostSimulator;
