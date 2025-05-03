
import React from 'react';
import PostSimulator from '@/components/post/PostSimulator';
import EmojiPicker from '@/components/emoji/EmojiPicker';
import AiAssistant from '@/components/chat/AiAssistant';
import { Card } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-4">
        {/* Main white card containing post simulator and emoji picker */}
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            {/* Post simulator - left side */}
            <div className="md:col-span-8 border-r border-gray-200 dark:border-gray-800">
              <PostSimulator />
            </div>
            
            {/* Emoji Picker - right side inside the white card */}
            <div className="md:col-span-4">
              <EmojiPicker />
            </div>
          </div>
        </div>
        
        {/* AI Assistant - outside the white card */}
        <div className="mt-4">
          <Card className="shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
            <AiAssistant />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
