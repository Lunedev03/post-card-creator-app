
import React, { useState } from 'react';
import { Copy, Check, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', 
  '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
  '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛',
  '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
];

const categories = [
  { icon: <Clock size={18} />, name: 'recent' },
  { icon: '😀', name: 'smileys' },
  { icon: '👋', name: 'people' },
  { icon: '🐶', name: 'animals' },
  { icon: '🍔', name: 'food' },
  { icon: '⚽', name: 'activities' },
  { icon: '🚗', name: 'travel' },
  { icon: '💡', name: 'objects' },
  { icon: '#️⃣', name: 'symbols' },
];

const EmojiPicker = () => {
  const [copiedEmoji, setCopiedEmoji] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredEmojis = searchQuery 
    ? emojis.filter(emoji => emoji.includes(searchQuery))
    : emojis;

  return (
    <div className="p-4 h-full">
      <h3 className="font-semibold mb-3 text-lg">Emojis</h3>
      
      <div className="relative mb-3">
        <Input
          placeholder="Buscar emoji..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>
      
      <div className="flex justify-between mb-4 overflow-x-auto pb-2">
        {categories.map((category, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className="min-w-min px-2"
          >
            {typeof category.icon === 'string' 
              ? <span className="text-lg">{category.icon}</span> 
              : category.icon
            }
          </Button>
        ))}
      </div>
      
      <div className="grid grid-cols-8 gap-1">
        {filteredEmojis.map((emoji, index) => (
          <Button
            key={index}
            variant="ghost"
            className="h-9 text-xl relative hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => handleCopyEmoji(emoji)}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
