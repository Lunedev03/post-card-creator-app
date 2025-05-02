
import React from 'react';
import PostSimulator from '@/components/post/PostSimulator';
import EmojiPicker from '@/components/emoji/EmojiPicker';
import AiAssistant from '@/components/chat/AiAssistant';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-green-800 pb-20">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <h2 className="text-2xl font-bold text-white/90 mb-4 text-center md:text-left">
            Crie e edite posts para redes sociais
          </h2>
          <p className="text-white/70 mb-6 text-center md:text-left">
            Use nossa ferramenta de IA para criar posts perfeitos
          </p>
        </div>
        
        <Card className="bg-black/70 border border-white/10 shadow-2xl overflow-hidden rounded-xl backdrop-blur-sm w-full max-w-5xl mx-auto animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-2 p-4 md:p-6">
              <PostSimulator />
            </div>
            <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 bg-black/0">
              <div className="h-[250px] bg-[#1A1F2C] rounded-lg overflow-hidden shadow-md hover-scale">
                <EmojiPicker />
              </div>
              <div className="flex-grow h-[400px] md:h-[500px] bg-[#1A1F2C] rounded-lg overflow-hidden shadow-md hover-scale">
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
