import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Message = {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  modelId: string;
};

interface ChatHistoryContextType {
  chats: Chat[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
  createNewChat: (modelId?: string) => Chat;
  updateChat: (id: string, updates: Partial<Omit<Chat, 'id'>>) => void;
  deleteChat: (id: string) => void;
  addMessageToChat: (chatId: string, message: Message) => void;
  getChatById: (id: string) => Chat | undefined;
  clearAllChats: () => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export const useChatHistory = () => {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
};

interface ChatHistoryProviderProps {
  children: ReactNode;
}

export const ChatHistoryProvider: React.FC<ChatHistoryProviderProps> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  // Inicializar do localStorage quando o componente montar
  useEffect(() => {
    const savedChats = localStorage.getItem('chatHistory');
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChats(parsedChats);
        
        // Recuperar chat ativo, se existir
        const activeId = localStorage.getItem('activeChatId');
        if (activeId) {
          const foundChat = parsedChats.find((c: Chat) => c.id === activeId);
          if (foundChat) {
            setActiveChat(foundChat);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar o histórico de chat:', error);
      }
    }
  }, []);

  // Salvar no localStorage quando chats mudar
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chats));
    if (activeChat) {
      localStorage.setItem('activeChatId', activeChat.id);
    }
  }, [chats, activeChat]);

  const createNewChat = (modelId = 'gpt-3.5-turbo'): Chat => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `Nova conversa ${new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })}`,
      messages: [
        {
          text: 'Olá! Como posso ajudar você hoje?',
          sender: 'ai',
          timestamp: new Date(),
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      modelId: modelId
    };

    setChats(prevChats => [newChat, ...prevChats]);
    setActiveChat(newChat);
    return newChat;
  };

  const updateChat = (id: string, updates: Partial<Omit<Chat, 'id'>>) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === id 
          ? { ...chat, ...updates, updatedAt: new Date() } 
          : chat
      )
    );

    // Atualizar também o chat ativo se for o mesmo
    if (activeChat?.id === id) {
      setActiveChat(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  };

  const deleteChat = (id: string) => {
    setChats(prevChats => prevChats.filter(chat => chat.id !== id));
    
    // Se o chat ativo for excluído, defina como null
    if (activeChat?.id === id) {
      setActiveChat(null);
    }
  };

  const addMessageToChat = (chatId: string, message: Message) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, message],
              updatedAt: new Date(),
              // Atualizar o título se for a primeira mensagem do usuário e tiver pelo menos 3 palavras
              title: chat.messages.length <= 1 && message.sender === 'user' && message.text.split(' ').length >= 3
                ? message.text.split(' ').slice(0, 5).join(' ') + '...'
                : chat.title
            }
          : chat
      )
    );

    // Atualizar também o chat ativo se for o mesmo
    if (activeChat?.id === chatId) {
      setActiveChat(prev => 
        prev ? {
          ...prev,
          messages: [...prev.messages, message],
          updatedAt: new Date(),
          title: prev.messages.length <= 1 && message.sender === 'user' && message.text.split(' ').length >= 3
            ? message.text.split(' ').slice(0, 5).join(' ') + '...'
            : prev.title
        } : null
      );
    }
  };

  const getChatById = (id: string) => {
    return chats.find(chat => chat.id === id);
  };

  const clearAllChats = () => {
    setChats([]);
    setActiveChat(null);
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('activeChatId');
  };

  return (
    <ChatHistoryContext.Provider
      value={{
        chats,
        activeChat,
        setActiveChat,
        createNewChat,
        updateChat,
        deleteChat,
        addMessageToChat,
        getChatById,
        clearAllChats
      }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
}; 