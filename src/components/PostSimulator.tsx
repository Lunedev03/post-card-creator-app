
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Download, FileImage } from 'lucide-react';
import { exportAsImage } from '@/utils/imageExport';

const PostSimulator = () => {
  const [postText, setPostText] = useState('O que você está pensando?');
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Ajusta a altura do textarea quando o componente é montado ou o texto muda
  useEffect(() => {
    adjustTextareaHeight();
  }, [postText]);

  return (
    <div className="flex flex-col items-center w-full p-4">
      <Card className="w-full max-w-[500px] overflow-hidden shadow-md rounded-lg mb-4 bg-white">
        <div
          ref={postRef}
          className="p-4 flex flex-col"
          style={{
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#ffffff'
          }}
        >
          <div className="mb-3">
            <Textarea
              ref={textareaRef}
              value={postText}
              onChange={handleTextChange}
              onFocus={handleTextareaFocus}
              onBlur={handleTextareaBlur}
              className="border-none resize-none focus-visible:ring-0 p-0 text-base"
              style={{
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                minHeight: '80px',
                lineHeight: '1.5',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontSize: '18px',
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
          
          {image ? (
            <div className="mt-2 overflow-hidden rounded-lg" style={{ marginBottom: '0' }}>
              <img 
                src={image} 
                alt="Imagem do post" 
                className="w-full h-auto object-contain"
                style={{ 
                  maxWidth: '100%', 
                  display: 'block',
                  width: '100%'
                }}
              />
            </div>
          ) : (
            <div
              className={`mt-2 flex items-center justify-center border-2 border-dashed rounded-lg ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              } h-40 overflow-hidden cursor-pointer`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleImageClick}
            >
              <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                <FileImage className="h-10 w-10 mb-2" />
                <p>Clique para fazer upload ou arraste e solte</p>
                <p className="text-xs text-gray-400">PNG, JPG, GIF até 10MB</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Button 
        onClick={handleExport} 
        className="flex gap-2 items-center bg-indigo-900 hover:bg-indigo-800"
      >
        <Download className="h-4 w-4" />
        Exportar como imagem
      </Button>
    </div>
  );
};

export default PostSimulator;
