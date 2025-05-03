
import React from 'react';
import PostSimulator from '@/components/post/PostSimulator';
import EmojiPicker from '@/components/emoji/EmojiPicker';
import AiAssistant from '@/components/chat/AiAssistant';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Post simulator */}
        <Card className="md:col-span-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
          <PostSimulator />
        </Card>
        
        {/* Right sidebar with AI Assistant and Emoji Picker */}
        <div className="md:col-span-6 grid grid-cols-1 gap-4">
          {/* AI Assistant */}
          <Card className="shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden h-[400px]">
            <AiAssistant />
          </Card>
          
          {/* Emoji Picker */}
          <Card className="shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden h-[280px]">
            <EmojiPicker />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
