
import React, { useState } from 'react';
import { Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

// Expanded emoji set
const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', 
  '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
  '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛',
  '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '🫡', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒',
  '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤',
  '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵',
  '🥶', '🥴', '😵', '😵‍💫', '🤯', '🤠', '🥳', '🥸',
  '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮',
  '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰',
  '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓',
  '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈',
  '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻',
  '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼',
  '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊'
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
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleCopyEmoji = (emoji: string) => {
    navigator.clipboard.writeText(emoji);
    
    toast({
      title: "Emoji copiado!",
      description: `${emoji} foi copiado para a área de transferência.`,
      duration: 1500,
    });
  };

  const filteredEmojis = searchQuery 
    ? emojis.filter(emoji => emoji.includes(searchQuery))
    : emojis;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-medium text-gray-800 dark:text-white">Emojis</h3>
      </div>
      
      <div className="p-4">
        <div className="relative mb-3">
          <Input
            placeholder="Buscar emoji..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        
        <div className="flex justify-between mb-3 overflow-x-auto pb-2 gap-1 scrollbar-thin">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className="min-w-min rounded-full h-8 w-8"
            >
              {typeof category.icon === 'string' 
                ? <span className="text-lg emoji-fix">{category.icon}</span> 
                : category.icon
              }
            </Button>
          ))}
        </div>
      </div>
      
      <ScrollArea className="flex-1 pb-3 px-4">
        <div className="grid grid-cols-7 gap-1">
          {filteredEmojis.map((emoji, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 rounded-md font-emoji"
              onClick={() => handleCopyEmoji(emoji)}
            >
              <span className="emoji-fix">{emoji}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EmojiPicker;
