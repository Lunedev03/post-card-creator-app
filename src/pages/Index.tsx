
import React, { useState } from 'react';
import PostSimulator from '@/components/post/PostSimulator';
import EmojiPicker from '@/components/emoji/EmojiPicker';
import AiAssistant from '@/components/chat/AiAssistant';
import { Card } from '@/components/ui/card';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import DraggableComponent from '@/components/layout/DraggableComponent';

const Index = () => {
  // Track positions for draggable components
  const [emojiPosition, setEmojiPosition] = useState({ x: 0, y: 0 });
  const [aiPosition, setAiPosition] = useState({ x: 0, y: 0 });
  
  return (
    <div className="min-h-screen pb-20 relative overflow-x-hidden">
      <div className="container mx-auto p-4 flex justify-center">
        {/* Centered Post Container with 1080x1920 aspect ratio */}
        <div className="max-w-[540px] w-full mx-auto">
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <PostSimulator />
          </div>
        </div>
        
        {/* Draggable Components */}
        <DraggableComponent 
          initialPosition={emojiPosition} 
          onPositionChange={setEmojiPosition}
          className="z-10"
        >
          <Card className="w-[300px] shadow-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <EmojiPicker />
          </Card>
        </DraggableComponent>
        
        <DraggableComponent 
          initialPosition={aiPosition} 
          onPositionChange={setAiPosition}
          className="z-10"
        >
          <Card className="w-[300px] shadow-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <AiAssistant />
          </Card>
        </DraggableComponent>
      </div>
    </div>
  );
};

export default Index;
