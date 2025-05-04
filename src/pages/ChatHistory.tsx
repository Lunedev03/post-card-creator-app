import React, { useState } from 'react';
import { useChatHistory, Chat, Message } from '@/contexts/ChatHistoryContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, MessageCircle, Search, Filter, Edit, Download, MessageSquare, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ChatHistoryPage = () => {
  const { chats, deleteChat, clearAllChats, createNewChat, setActiveChat, updateChat } = useChatHistory();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [chatToRename, setChatToRename] = useState<string | null>(null);
  
  const filteredChats = React.useMemo(() => {
    if (!searchTerm.trim()) return chats;
    
    const query = searchTerm.toLowerCase();
    return chats.filter(chat => 
      chat.title.toLowerCase().includes(query) || 
      chat.messages.some(msg => msg.text.toLowerCase().includes(query))
    );
  }, [chats, searchTerm]);

  const handleDelete = (id: string) => {
    setChatToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (chatToDelete) {
      deleteChat(chatToDelete);
      toast({
        title: "Conversa excluída",
        description: "A conversa foi removida do histórico.",
      });
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleClearAll = () => {
    if (chats.length > 0) {
      clearAllChats();
      toast({
        title: "Histórico limpo",
        description: "Todas as conversas foram removidas do histórico.",
      });
    }
  };

  const handleRename = (chat: Chat) => {
    setChatToRename(chat.id);
    setRenameValue(chat.title);
    setIsRenameDialogOpen(true);
  };
  
  const confirmRename = () => {
    if (chatToRename && renameValue.trim()) {
      updateChat(chatToRename, { title: renameValue });
      toast({
        title: "Conversa renomeada",
        description: "O título da conversa foi atualizado.",
      });
      setIsRenameDialogOpen(false);
    }
  };
  
  const handleOpenChat = (chat: Chat) => {
    setSelectedChat(chat);
  };
  
  const handleUseChat = (chat: Chat) => {
    setActiveChat(chat.id);
    toast({
      title: "Conversa ativada",
      description: "Você pode continuar essa conversa no assistente.",
    });
    setSelectedChat(null);
  };
  
  const formatDate = (date: Date) => {
    return format(new Date(date), "d 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen pb-20 pt-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-4">
          {/* Header section with search */}
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
            <h1 className="text-2xl font-bold">Histórico de Conversas</h1>
            
            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <div className="relative">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Buscar conversas..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 dark:bg-black/20 w-full md:w-64"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="default"
                  onClick={() => {
                    const newChat = createNewChat();
                    setActiveChat(newChat.id);
                    toast({
                      title: "Nova conversa criada",
                      description: "Você pode continuar essa conversa no assistente.",
                    });
                  }}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <Plus size={16} className="mr-2" /> Nova Conversa
                </Button>
                
                {chats.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={handleClearAll}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar histórico
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Empty state */}
          {filteredChats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-white/5 dark:bg-black/20 rounded-xl">
              {chats.length === 0 ? (
                <>
                  <div className="h-20 w-20 rounded-full bg-purple-900/20 flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-purple-400" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-lg font-medium mb-1">Seu histórico está vazio</p>
                  <p className="text-gray-500 text-center">As conversas que você tiver aparecerão aqui</p>
                </>
              ) : (
                <>
                  <div className="h-20 w-20 rounded-full bg-purple-900/20 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-purple-400" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-lg font-medium mb-1">Nenhum resultado encontrado</p>
                  <p className="text-gray-500 text-center">Tente usar termos diferentes na busca</p>
                </>
              )}
            </div>
          )}
          
          {/* Grid View */}
          {filteredChats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChats.map((chat) => (
                <Card 
                  key={chat.id} 
                  className="overflow-hidden bg-white/5 dark:bg-black/20 hover:bg-purple-50/10 dark:hover:bg-purple-900/10 transition-all"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(chat.updatedAt)}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-purple-500 hover:bg-purple-500/10 p-1 h-auto"
                          onClick={() => handleRename(chat)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-red-500 hover:bg-red-500/10 p-1 h-auto"
                          onClick={() => handleDelete(chat.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-medium mb-2 line-clamp-1">
                      {chat.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 break-words whitespace-pre-wrap text-sm line-clamp-2 h-10 mb-3">
                      {chat.messages.length > 1 
                        ? chat.messages[chat.messages.length - 1].text 
                        : "Nenhuma mensagem"}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MessageSquare size={14} className="mr-1" />
                        {chat.messages.length} mensagens
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenChat(chat)}
                        >
                          Ver
                        </Button>
                        <Button 
                          size="sm"
                          className="bg-purple-500 hover:bg-purple-600"
                          onClick={() => handleUseChat(chat)}
                        >
                          Continuar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Dialog for viewing a chat */}
      {selectedChat && (
        <Dialog open={selectedChat !== null} onOpenChange={(open) => !open && setSelectedChat(null)}>
          <DialogContent className="sm:max-w-[90%] md:max-w-[70%] lg:max-w-[60%] h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{selectedChat.title}</DialogTitle>
            </DialogHeader>
            
            <div className="flex-grow overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="flex flex-col space-y-4">
                  {selectedChat.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.sender === 'user'
                            ? 'bg-purple-500 text-white rounded-br-none'
                            : 'bg-gray-100 dark:bg-gray-800 rounded-bl-none text-gray-800 dark:text-white'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <span className={`text-xs block text-right mt-1 ${
                          msg.sender === 'user' 
                            ? 'text-white/70'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <DialogClose asChild>
                <Button variant="outline">Fechar</Button>
              </DialogClose>
              <Button 
                className="bg-purple-500 hover:bg-purple-600"
                onClick={() => handleUseChat(selectedChat)}
              >
                Continuar conversa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Dialog for confirming deletion */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conversa</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for renaming chat */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear conversa</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Novo título para a conversa"
              className="w-full"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="default" 
              onClick={confirmRename}
              disabled={!renameValue.trim()}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatHistoryPage; 