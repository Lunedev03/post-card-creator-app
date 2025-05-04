import React, { useState, useEffect } from 'react';
import PostSimulator from '@/components/post/PostSimulator';
import EmojiPicker from '@/components/emoji/EmojiPicker';
import AiAssistant from '@/components/chat/AiAssistant';
import DraggableComponent from '@/components/layout/DraggableComponent';
import { Button } from '@/components/ui/button';
import { Smile, MessageCircle, X } from 'lucide-react';

const Index = () => {
  // Controle de visibilidade para dispositivos móveis
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  
  // Estado para verificação do tamanho da tela
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  // Track positions and sizes for draggable components
  const [emojiPosition, setEmojiPosition] = useState({ x: 10, y: 10 });
  const [emojiSize, setEmojiSize] = useState({ width: 300, height: 400 });
  
  const [aiPosition, setAiPosition] = useState({ x: 10, y: 10 });
  const [aiSize, setAiSize] = useState({ width: 320, height: 500 });
  
  // Detectar tamanho da tela e ajustar componentes
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 768);
      
      // Ajustar posições baseadas no tamanho da tela
      if (width > 1200) {
        // Telas grandes - posiciona à direita
        setAiPosition({ x: width - 350, y: 80 });
        setEmojiPosition({ x: width - 350, y: 600 });
        setEmojiSize({ width: 300, height: 400 });
        setAiSize({ width: 320, height: 500 });
      } else if (width > 768) {
        // Tablets - posições ajustadas
        setAiPosition({ x: width - 350, y: 80 });
        setEmojiPosition({ x: 20, y: 80 });
        setEmojiSize({ width: 280, height: 350 });
        setAiSize({ width: 300, height: 450 });
      } else {
        // Dispositivos móveis - centraliza
        setAiPosition({ x: (width - 300) / 2, y: 100 });
        setEmojiPosition({ x: (width - 300) / 2, y: 100 });
        setEmojiSize({ width: 300, height: 350 });
        setAiSize({ width: 300, height: 450 });
      }
    };
    
    // Configurar o ouvinte de redimensionamento
    window.addEventListener('resize', handleResize);
    handleResize(); // Inicializar
    
    // Limpar ao desmontar
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Alternar componentes para exibição móvel
  const toggleEmojiPicker = () => {
    if (isMobile) {
      setShowEmojiPicker(!showEmojiPicker);
      if (showAiAssistant) setShowAiAssistant(false);
    }
  };
  
  const toggleAiAssistant = () => {
    if (isMobile) {
      setShowAiAssistant(!showAiAssistant);
      if (showEmojiPicker) setShowEmojiPicker(false);
    }
  };
  
  return (
    <div className="min-h-screen pb-20 relative overflow-x-hidden">
      <div className="container mx-auto p-4 flex flex-col items-center">
        {/* Post Container */}
        <div className="max-w-[540px] w-full mx-auto mb-4">
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <PostSimulator />
          </div>
        </div>
        
        {/* Botões de controle para mobile (fixos no canto inferior) */}
        {isMobile && (
          <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-20">
            <Button
              size="icon"
              variant={showEmojiPicker ? "default" : "outline"}
              className="h-12 w-12 rounded-full shadow-md"
              onClick={toggleEmojiPicker}
            >
              {showEmojiPicker ? <X size={20} /> : <Smile size={20} />}
            </Button>
            
            <Button
              size="icon"
              variant={showAiAssistant ? "default" : "outline"}
              className="h-12 w-12 rounded-full shadow-md"
              onClick={toggleAiAssistant}
            >
              {showAiAssistant ? <X size={20} /> : <MessageCircle size={20} />}
            </Button>
          </div>
        )}
        
        {/* Draggable Components - visíveis condicionalmente em mobile */}
        {(!isMobile || showEmojiPicker) && (
          <DraggableComponent 
            initialPosition={emojiPosition} 
            initialSize={emojiSize}
            onPositionChange={setEmojiPosition}
            onSizeChange={setEmojiSize}
            className="z-10"
            preventExitViewport={false}
          >
            <EmojiPicker />
          </DraggableComponent>
        )}
        
        {(!isMobile || showAiAssistant) && (
          <DraggableComponent 
            initialPosition={aiPosition} 
            initialSize={aiSize}
            onPositionChange={setAiPosition}
            onSizeChange={setAiSize}
            className="z-10"
            preventExitViewport={false}
          >
            <AiAssistant />
          </DraggableComponent>
        )}
      </div>
    </div>
  );
};

export default Index;
