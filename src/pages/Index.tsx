import React from 'react';
import PostSimulator from '@/components/post/PostSimulator';
import EmojiPicker from '@/components/emoji/EmojiPicker';
import AiAssistant from '@/components/chat/AiAssistant';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
const Index = () => {
  return <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-green-800 pb-20">
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-8">
          
          
        </div>

        <div className="flex justify-center gap-4 mb-12">
          
          
        </div>

        <Card className="bg-black/70 border border-white/10 shadow-2xl overflow-hidden rounded-xl backdrop-blur-sm max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-6">
              <PostSimulator />
            </div>
            <div className="flex flex-col gap-6 p-6 bg-black/0">
              <div className="h-[250px]">
                <EmojiPicker />
              </div>
              <div className="flex-grow h-[500px]">
                <AiAssistant />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>;
};
export default Index;