import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileImage, Save } from 'lucide-react';
import { exportAsImage } from '@/utils/imageExport';
import { usePostHistory } from '@/contexts/PostHistoryContext';
import { useToast } from '@/hooks/use-toast';
import PostTextInput from './PostTextInput';
import ImageGrid from './ImageGrid';
import ImageUploader from './ImageUploader';

// Componente de botão memoizado para evitar re-renders
const ActionButton = memo(({ 
  onClick, 
  icon, 
  label, 
  mobileLabel, 
  isMobile, 
  variant = "default", 
  className = "" 
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  mobileLabel: string;
  isMobile: boolean;
  variant?: "default" | "outline";
  className?: string;
}) => (
  <Button 
    onClick={onClick} 
    variant={variant}
    className={className}
  >
    {icon}
    {isMobile ? mobileLabel : label}
  </Button>
));

ActionButton.displayName = 'ActionButton';

const PostSimulator = () => {
  const [postText, setPostText] = useState('O que você está pensando?');
  const [images, setImages] = useState<string[]>([]);
  const [containerHeight, setContainerHeight] = useState('auto');
  const [isMobile, setIsMobile] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLDivElement>(null);
  const { addPost } = usePostHistory();
  const { toast } = useToast();

  // Detectar se é dispositivo móvel - memoizado para evitar recálculos
  const checkIfMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [checkIfMobile]);

  // Atualizar a altura do container baseado no conteúdo - memoizado
  const updateContainerHeight = useCallback(() => {
    if (images.length > 0) {
      setContainerHeight('auto');
    } else {
      const textHeight = textInputRef.current?.offsetHeight || 0;
      const minHeight = isMobile 
        ? Math.max(150, textHeight + 80) 
        : Math.max(180, textHeight + 100);
      setContainerHeight(`${minHeight}px`);
    }
  }, [images.length, isMobile]);

  // Effect para atualizar a altura do container
  useEffect(() => {
    updateContainerHeight();
    window.addEventListener('resize', updateContainerHeight);
    return () => window.removeEventListener('resize', updateContainerHeight);
  }, [updateContainerHeight]);

  // Callback para mudança de texto - memoizado
  const handleTextChange = useCallback((text: string) => {
    setPostText(text);
  }, []);

  // Callback para adicionar imagens - memoizado
  const addImages = useCallback((newImages: string[]) => {
    setImages(prev => {
      const combined = [...prev, ...newImages];
      return combined.slice(0, 4); // Limitar a 4 imagens
    });
  }, []);

  // Callback para remover imagem - memoizado
  const removeImage = useCallback((indexToRemove: number) => {
    setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  }, []);
  
  // Callback para reordenar imagens - memoizado
  const handleReorderImages = useCallback((newOrder: string[]) => {
    setImages(newOrder);
    toast({
      title: "Imagens reordenadas!",
      description: "A ordem das imagens foi atualizada.",
      duration: 1500,
    });
  }, [toast]);

  // Callback para exportar imagem - memoizado
  const handleExport = useCallback(() => {
    if (postRef.current) {
      exportAsImage(postRef.current, 'meu-post.png');
    }
  }, []);

  // Callback para salvar no histórico - memoizado
  const handleSaveToHistory = useCallback(() => {
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
  }, [postText, images, addPost, toast]);

  // Callback para fazer upload de imagem - memoizado
  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const files = Array.from(target.files);
        const newImages: string[] = [];
        let loadedCount = 0;
        
        files.forEach(file => {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            if (loadEvent.target?.result) {
              newImages.push(loadEvent.target.result as string);
            }
            
            loadedCount++;
            if (loadedCount === files.length) {
              // Adiciona todas as imagens de uma vez para evitar múltiplos re-renders
              addImages(newImages);
            }
          };
          reader.readAsDataURL(file);
        });
      }
    };
    input.click();
  }, [addImages]);

  // Cálculo das classes de botão - memoizado
  const buttonClasses = {
    primary: `bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm ${isMobile ? 'w-full' : 'flex-1'}`,
    outline: `border-blue-500 text-blue-500 text-xs sm:text-sm ${isMobile ? 'w-full' : 'flex-1'}`,
    full: "w-full border-blue-500 text-blue-500 text-xs sm:text-sm"
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
          <ActionButton 
            onClick={handleExport}
            icon={<Download className="h-4 w-4 mr-2" />}
            label="Exportar como imagem"
            mobileLabel="Exportar"
            isMobile={isMobile}
            className={buttonClasses.primary}
          />
          
          <ActionButton 
            onClick={handleSaveToHistory}
            icon={<Save className="h-4 w-4 mr-2" />}
            label="Salvar no histórico"
            mobileLabel="Salvar"
            isMobile={isMobile}
            variant="outline"
            className={buttonClasses.outline}
          />
        </div>
        
        {images.length > 0 && (
          <ActionButton 
            onClick={handleImageUpload}
            icon={<FileImage className="h-4 w-4 mr-2" />}
            label={`Adicionar mais imagens ${images.length}/4`}
            mobileLabel={`Adicionar mais imagens ${images.length}/4`}
            isMobile={isMobile}
            variant="outline"
            className={buttonClasses.full}
          />
        )}
      </div>
    </div>
  );
};

export default memo(PostSimulator);
