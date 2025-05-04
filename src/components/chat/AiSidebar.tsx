import React, { useState } from 'react';
import { MessageCircle, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useChatHistory, Chat } from '@/contexts/ChatHistoryContext';
import { ScrollArea } from '@/components/ui/scroll-area';

type AiSidebarProps = {
  onChatSelect: (chat: Chat) => void;
  onNewChat: () => void;
  isOpened: boolean;
};

export const AiSidebar: React.FC<AiSidebarProps> = ({ 
  onChatSelect, 
  onNewChat,
  isOpened 
}) => {
  const { chats, activeChat, createNewChat } = useChatHistory();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = React.useMemo(() => {
    if (!searchQuery.trim()) return chats;
    
    const query = searchQuery.toLowerCase();
    return chats.filter(chat => 
      chat.title.toLowerCase().includes(query) || 
      chat.messages.some(msg => msg.text.toLowerCase().includes(query))
    );
  }, [chats, searchQuery]);

  const handleNewChat = () => {
    const newChat = createNewChat();
    onChatSelect(newChat);
    onNewChat();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  // Agrupar chats por data
  const groupedChats = React.useMemo(() => {
    const groups: Record<string, Chat[]> = {};
    
    filteredChats.forEach(chat => {
      const dateKey = formatDate(chat.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(chat);
    });
    
    return groups;
  }, [filteredChats]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex flex-col gap-2">
        <Button
          onClick={() => createNewChat()}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
        >
          <Plus size={16} className="mr-2" /> Nova Conversa
        </Button>
        
        <div className="relative">
          <Search size={16} className="absolute left-2.5 top-2.5 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Buscar conversas"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-gray-50 dark:bg-gray-900 h-9"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-grow">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 h-full text-gray-500 dark:text-gray-400">
            <p className="mb-2 text-center">Nenhuma conversa encontrada</p>
            {!searchQuery && (
              <Button 
                variant="ghost"
                onClick={handleNewChat}
                className="text-purple-500 hover:text-purple-600"
              >
                Iniciar uma nova conversa
              </Button>
            )}
          </div>
        ) : (
          Object.entries(groupedChats).map(([dateKey, dateChats]) => (
            <div key={dateKey} className="mb-4">
              <div className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                {dateKey}
              </div>
              {dateChats.map((chat) => (
                <div 
                  key={chat.id}
                  className={`p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 ${
                    activeChat?.id === chat.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                  }`}
                  onClick={() => onChatSelect(chat)}
                >
                  <h3 className="font-medium text-sm text-gray-800 dark:text-white line-clamp-1">
                    {chat.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <p>{formatDate(chat.updatedAt)}</p>
                    <p>{chat.messages.length - 1} mensagens</p>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
};

export default AiSidebar; 