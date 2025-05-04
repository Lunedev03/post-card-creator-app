import React from 'react';
import { Plus, Trash2, Edit, Search } from 'lucide-react';
import { useChatHistory, Chat } from '@/contexts/ChatHistoryContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ChatHistory: React.FC = () => {
  const { chats, activeChat, setActiveChat, createNewChat, deleteChat, updateChat } = useChatHistory();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isEditingTitle, setIsEditingTitle] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [chatToDelete, setChatToDelete] = React.useState<string | null>(null);

  const filteredChats = React.useMemo(() => {
    if (!searchQuery.trim()) return chats;
    
    const query = searchQuery.toLowerCase();
    return chats.filter(chat => 
      chat.title.toLowerCase().includes(query) || 
      chat.messages.some(msg => msg.text.toLowerCase().includes(query))
    );
  }, [chats, searchQuery]);

  const handleStartEdit = (chat: Chat) => {
    setIsEditingTitle(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      updateChat(id, { title: editTitle });
    }
    setIsEditingTitle(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(null);
    setEditTitle('');
  };

  const handleDeleteClick = (id: string) => {
    setChatToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (chatToDelete) {
      deleteChat(chatToDelete);
      setChatToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
                onClick={() => createNewChat()}
                className="text-purple-500 hover:text-purple-600"
              >
                Iniciar uma nova conversa
              </Button>
            )}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div 
              key={chat.id}
              className={`p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 ${
                activeChat?.id === chat.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
              }`}
              onClick={() => isEditingTitle !== chat.id && setActiveChat(chat)}
            >
              {isEditingTitle === chat.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-grow text-sm h-8"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(chat.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveEdit(chat.id);
                    }}
                    className="h-8 px-2"
                  >
                    Salvar
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm text-gray-800 dark:text-white line-clamp-1 flex-grow">
                      {chat.title}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(chat);
                        }}
                      >
                        <Edit size={14} className="text-gray-500 dark:text-gray-400" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(chat.id);
                        }}
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <p>{formatDate(chat.updatedAt)}</p>
                    <p>{chat.messages.length - 1} mensagens</p>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </ScrollArea>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conversa</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatHistory; 