
import React from 'react';
import PostSimulator from '@/components/post/PostSimulator';
import EmojiPicker from '@/components/emoji/EmojiPicker';
import AiAssistant from '@/components/chat/AiAssistant';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-green-800 pb-20">
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">The AI Code Editor</h1>
          <p className="text-xl text-white">Built to make you extraordinarily productive, create amazing social media posts with AI.</p>
        </div>

        <div className="flex justify-center gap-4 mb-12">
          <Button className="bg-white text-black hover:bg-gray-200 flex items-center gap-2 px-6 py-6 rounded-lg">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6.5C3 5.67157 3.67157 5 4.5 5H19.5C20.3284 5 21 5.67157 21 6.5V17.5C21 18.3284 20.3284 19 19.5 19H4.5C3.67157 19 3 18.3284 3 17.5V6.5Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 19V22M13 19V22" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 22H15" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            DOWNLOAD FOR WINDOWS
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white/10 px-6 py-6 rounded-lg">
            ALL DOWNLOADS
          </Button>
        </div>

        <Card className="bg-black/70 border border-white/10 shadow-2xl overflow-hidden rounded-xl backdrop-blur-sm max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-6">
              <PostSimulator />
            </div>
            <div className="flex flex-col gap-6 p-6 bg-black/50">
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
    </div>
  );
};

export default Index;
