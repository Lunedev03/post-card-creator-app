
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Download, FileImage, Save, X, CheckCircle } from 'lucide-react';
import { exportAsImage } from '@/utils/imageExport';
import { usePostHistory } from '@/contexts/PostHistoryContext';
import { useToast } from '@/hooks/use-toast';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const PostSimulator = () => {
  const [postText, setPostText] = useState('O que você está pensando?');
  const [images, setImages] = useState<string[]>([]);
  const [userName, setUserName] = useState('@_UsuarioX');
  const [displayName, setDisplayName] = useState('Nome do Usuário');
  const [date, setDate] = useState('Abr 29');
  const [verified, setVerified] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addPost } = usePostHistory();
  const { toast } = useToast();

  // Ajusta a altura do textarea ao digitar
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
    adjustTextareaHeight();
  };

  const handleTextareaFocus = () => {
    if (postText === 'O que você está pensando?' && textareaRef.current) {
      setPostText('');
    }
  };

  const handleTextareaBlur = () => {
    if (postText.trim() === '' && textareaRef.current) {
      setPostText('O que você está pensando?');
    }
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const toggleVerified = () => {
    setVerified(!verified);
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      
      files.forEach(file => {
        if (file.type.match('image.*')) {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            setImages(prev => [...prev, loadEvent.target?.result as string]);
          };
          reader.readAsDataURL(file);
        }
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
            setImages(prev => [...prev, loadEvent.target?.result as string]);
          };
          reader.readAsDataURL(file);
        });
      }
    };
    input.click();
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const handleExport = () => {
    if (postRef.current) {
      exportAsImage(postRef.current, 'meu-tweet.png');
    }
  };

  const handleSaveToHistory = () => {
    if (postText !== 'O que você está pensando?') {
      addPost({
        text: postText,
        images: images,
        userName,
        displayName,
        date,
        verified
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

  // Ajusta a altura do textarea quando o componente é montado ou o texto muda
  useEffect(() => {
    adjustTextareaHeight();
  }, [postText]);

  const getImageGrid = () => {
    if (images.length === 0) return null;
    
    if (images.length === 1) {
      return (
        <div className="mt-3 overflow-hidden rounded-xl">
          <img 
            src={images[0]} 
            alt="Imagem do post" 
            className="w-full h-auto object-cover"
          />
        </div>
      );
    }
    
    return (
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
    );
  };

  return (
    <div className="flex flex-col items-center w-full p-4">
      <div className="w-full max-w-[500px] mb-6">
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex gap-4 items-center mb-3">
            <input 
              type="text" 
              value={displayName} 
              onChange={handleDisplayNameChange}
              className="font-bold text-base border-b border-transparent hover:border-gray-300 focus:outline-none focus:border-blue-400 transition-colors"
            />
            <div className="flex items-center gap-1">
              {verified && <CheckCircle size={16} className="text-blue-500 fill-blue-500" />}
              <input 
                type="text" 
                value={userName} 
                onChange={handleUserNameChange}
                className="text-gray-500 text-sm border-b border-transparent hover:border-gray-300 focus:outline-none focus:border-blue-400 transition-colors"
              />
            </div>
            <div className="text-gray-500 text-sm flex items-center gap-1">
              · 
              <input 
                type="text" 
                value={date} 
                onChange={handleDateChange}
                className="text-gray-500 text-sm w-[60px] border-b border-transparent hover:border-gray-300 focus:outline-none focus:border-blue-400 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center">
              <input 
                type="checkbox" 
                checked={verified} 
                onChange={toggleVerified}
                id="verified" 
                className="mr-1"
              />
              <label htmlFor="verified" className="text-sm">Verificado</label>
            </div>
          </div>
        </div>
      </div>
      
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
          <div className="flex gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              <img 
                src={`/lovable-uploads/577ba77b-cea9-44b6-b377-1fe0b8085149.png`}
                alt="Profile" 
                className="h-full w-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48';
                }}
              />
            </div>
            
            <div className="flex flex-col flex-1">
              <div className="flex items-center">
                <span className="font-bold text-[15px]">{displayName}</span>
                {verified && <CheckCircle size={16} className="text-blue-500 fill-blue-500 ml-1" />}
                <span className="text-gray-500 text-[15px] ml-1">{userName} · {date}</span>
              </div>
              
              <div className="mb-1">
                <Textarea
                  ref={textareaRef}
                  value={postText}
                  onChange={handleTextChange}
                  onFocus={handleTextareaFocus}
                  onBlur={handleTextareaBlur}
                  className="border-none resize-none focus-visible:ring-0 p-0 text-base min-h-0"
                  style={{
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '15px',
                    overflow: 'hidden',
                    textAlign: 'left',
                    width: '100%',
                    padding: '0',
                    margin: '0',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                  placeholder="O que você está pensando?"
                />
              </div>
              
              {images.length > 0 ? (
                <div className="relative mt-2">
                  {getImageGrid()}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {images.map((_, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        size="sm"
                        className="p-1 h-8 w-8"
                        onClick={() => removeImage(index)}
                      >
                        <X size={16} />
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className={`mt-2 flex items-center justify-center border-2 border-dashed rounded-lg ${
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
              )}
            </div>
          </div>
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
