
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const emojis = [
  '😀', '😂', '😊', '🥰', '😍', '🤩', '😎', '🥳',
  '😭', '😤', '😡', '🥺', '😴', '🤔', '🙄', '😬',
  '👍', '👎', '👏', '🙌', '🤝', '👊', '✌️', '🤞',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
];

const EmojiPicker = () => {
  const [copiedEmoji, setCopiedEmoji] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopyEmoji = (emoji: string) => {
    navigator.clipboard.writeText(emoji);
    setCopiedEmoji(emoji);
    
    toast({
      title: "Emoji copiado!",
      description: `${emoji} foi copiado para a área de transferência.`,
    });
    
    setTimeout(() => {
      setCopiedEmoji(null);
    }, 2000);
  };

  return (
    <Card className="bg-[#1E1E1E] border border-white/10 text-white p-4 h-full overflow-auto">
      <h3 className="font-semibold mb-3 text-lg">Emojis</h3>
      <div className="grid grid-cols-4 gap-2">
        {emojis.map((emoji, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-12 text-2xl relative bg-[#252525] border-white/5 hover:bg-[#333333]"
            onClick={() => handleCopyEmoji(emoji)}
          >
            {emoji}
            <span className="absolute top-0 right-0 bg-[#333333] rounded-full p-0.5 transform translate-x-1/3 -translate-y-1/3">
              {copiedEmoji === emoji ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 text-gray-400" />
              )}
            </span>
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default EmojiPicker;
