
import React from 'react';
import PostSimulator from '@/components/post/PostSimulator';
import EmojiPicker from '@/components/emoji/EmojiPicker';
import AiAssistant from '@/components/chat/AiAssistant';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-green-800 pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2">
            <PostSimulator />
          </div>
          <div className="flex flex-col gap-6">
            <div className="h-[250px]">
              <EmojiPicker />
            </div>
            <div className="flex-grow h-[500px]">
              <AiAssistant />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
