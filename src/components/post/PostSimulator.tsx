import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
  const [containerHeight, setContainerHeight] = useState('auto');
  const [isMobile, setIsMobile] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLDivElement>(null);
  const { addPost } = usePostHistory();
  const { toast } = useToast();

  const handleTextChange = (text: string) => {
    setPostText(text);
  };

  // Detectar se é dispositivo móvel
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Ajusta a altura do container com base no conteúdo
  useEffect(() => {
    const updateContainerHeight = () => {
      // Se tem imagens, verifica o tamanho delas para definir a altura
      if (images.length > 0) {
        setContainerHeight('auto');
      } else {
        // Se não tem imagens, define uma altura menor
        const textHeight = textInputRef.current?.offsetHeight || 0;
        // Altura ajustada para dispositivos móveis vs desktop
        const minHeight = isMobile 
          ? Math.max(150, textHeight + 80) 
          : Math.max(180, textHeight + 100);
        setContainerHeight(`${minHeight}px`);
      }
    };

    updateContainerHeight();
    
    // Adiciona listener para redimensionar quando a janela muda de tamanho
    window.addEventListener('resize', updateContainerHeight);
    return () => window.removeEventListener('resize', updateContainerHeight);
  }, [images, postText, isMobile]);

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
  
  const handleReorderImages = (newOrder: string[]) => {
    setImages(newOrder);
    toast({
      title: "Imagens reordenadas!",
      description: "A ordem das imagens foi atualizada.",
      duration: 1500,
    });
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
    <div className="flex flex-col items-center w-full p-2 sm:p-4">
      {/* Post container */}
      <div className="w-full max-w-[540px] mx-auto">
        <div
          ref={postRef}
          className="w-full mb-3 sm:mb-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 overflow-hidden rounded-lg transition-all duration-200"
          style={{
            minHeight: containerHeight,
            height: 'auto'
          }}
        >
          <div className="p-3 sm:p-4 h-full flex flex-col">
            <div ref={textInputRef}>
              <PostTextInput value={postText} onChange={handleTextChange} />
            </div>
            
            {images.length > 0 ? (
              <ImageGrid 
                images={images} 
                onRemoveImage={removeImage} 
                onReorderImages={handleReorderImages}
              />
            ) : (
              <div 
                className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-3 sm:p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-all mt-2 sm:mt-3 flex-1 min-h-[100px] sm:min-h-[140px]"
                onClick={handleImageUpload}
              >
                <FileImage className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-2" />
                <p className="text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Clique para fazer upload ou arraste e solte
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  PNG, JPG, GIF (máximo 4 imagens)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Botões de ação responsivos */}
        <div className={`flex w-full ${isMobile ? 'flex-col gap-2' : 'gap-2'} mb-3 sm:mb-4`}>
          <Button 
            onClick={handleExport} 
            className={`bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm ${isMobile ? 'w-full' : 'flex-1'}`}
          >
            <Download className="h-4 w-4 mr-2" />
            {isMobile ? 'Exportar' : 'Exportar como imagem'}
          </Button>
          
          <Button 
            onClick={handleSaveToHistory}
            variant="outline" 
            className={`border-blue-500 text-blue-500 text-xs sm:text-sm ${isMobile ? 'w-full' : 'flex-1'}`}
          >
            <Save className="h-4 w-4 mr-2" />
            {isMobile ? 'Salvar' : 'Salvar no histórico'}
          </Button>
        </div>
        
        {images.length > 0 && (
          <Button 
            onClick={handleImageUpload}
            variant="outline" 
            className="w-full border-blue-500 text-blue-500 text-xs sm:text-sm"
          >
            <FileImage className="h-4 w-4 mr-2" />
            Adicionar mais imagens {images.length}/4
          </Button>
        )}
      </div>
    </div>
  );
};

export default PostSimulator;
