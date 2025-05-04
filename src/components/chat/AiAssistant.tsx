import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, ChevronLeft, ChevronRight, Plus, Search, Settings, Trash2, Moon, Sun, Newspaper, Sparkles, Image as ImageIcon, Zap, Star, Cpu, BrainCircuit, X } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useChatHistory, Message, Chat } from '@/contexts/ChatHistoryContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sendMessageToOpenAI, isOpenAIConfigured } from '@/services/openai';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

type LLMModel = {
  id: string;
  name: string;
  description?: string;
  icon?: any;
};

const llmModels: LLMModel[] = [
  { 
    id: 'gpt-3.5-turbo', 
    name: 'GPT-3.5 Turbo',
    description: 'Rápido e econômico para tarefas comuns',
    icon: Zap
  },
  { 
    id: 'gpt-3.5-turbo-16k', 
    name: 'GPT-3.5 Turbo (16K)',
    description: 'Suporta contextos mais longos de até 16K tokens',
    icon: Zap
  },
  { 
    id: 'gpt-4o', 
    name: 'GPT-4o',
    description: 'Modelo mais avançado da OpenAI, com alta capacidade de raciocínio',
    icon: BrainCircuit
  },
  { 
    id: 'gpt-4o-mini', 
    name: 'GPT-4o Mini',
    description: 'Versão mais rápida e econômica do GPT-4o',
    icon: Cpu
  },
  { 
    id: 'gpt-4-turbo', 
    name: 'GPT-4 Turbo',
    description: 'Modelo avançado com conhecimento até abril de 2023',
    icon: Star
  },
];

const AiAssistant = () => {
  const { chats, activeChat, createNewChat, addMessageToChat, updateChat, setActiveChat, clearAllChats } = useChatHistory();
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activePromptMode, setActivePromptMode] = useState<string>('default');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Verificar configuração da API OpenAI
  useEffect(() => {
    setIsApiConfigured(isOpenAIConfigured());
  }, []);
  
  // Detectar se é dispositivo móvel e tema
  useEffect(() => {
    const checkIfMobile = () => {
      const mobileWidth = window.innerWidth < 768;
      setIsMobile(mobileWidth);
      
      // No celular, começamos com a sidebar fechada
      if (mobileWidth && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    
    // Verificar o tema atual
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkIfMobile();
    checkTheme();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [isSidebarOpen]);
  
  // Se não houver chat ativo, crie um novo
  useEffect(() => {
    if (!activeChat) {
      createNewChat();
    }
  }, [activeChat, createNewChat]);
  
  // Adicionar prevenção de rolagem em elementos interativos
  useEffect(() => {
    // Função para prevenir rolagem indesejada em elementos interativos
    const preventScrollOnInteractiveElements = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      
      // Lista de seletores de elementos interativos que não devem causar rolagem
      const interactiveSelectors = [
        'button', '.button', '[role="button"]', 
        'a', 'input', 'select', 'textarea',
        '.draggable-header', '.cursor-pointer'
      ];
      
      // Verificar se o elemento ou seus pais correspondem aos seletores
      const isInteractive = interactiveSelectors.some(selector => 
        target.matches(selector) || !!target.closest(selector)
      );
      
      if (isInteractive) {
        // Impedir o comportamento padrão apenas para elementos interativos
        e.preventDefault();
      }
    };
    
    // Adicionar evento touchstart com opção passive: false para permitir preventDefault
    document.addEventListener('touchstart', preventScrollOnInteractiveElements, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', preventScrollOnInteractiveElements);
    };
  }, []);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Verificar se estamos próximos ao final antes de fazer scroll
      const container = document.querySelector('.scrollable-content');
      const isNearBottom = container 
        ? container.scrollHeight - container.scrollTop - container.clientHeight < 100
        : true;
      
      // Se estiver próximo ao final ou for uma nova mensagem, role para o fim
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };
  
  useEffect(() => {
    // Só fazer scroll quando houver mensagens e o chat estiver ativo
    if (activeChat?.messages?.length) {
      // Usar um timeout pequeno para garantir que o DOM foi atualizado antes de rolar
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [activeChat?.messages]);

  const handleToggleSidebar = (e?: React.MouseEvent) => {
    if (e) e.preventDefault(); // Prevenir comportamento padrão de rolagem
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };
  
  const handleImageRemove = (e?: React.MouseEvent) => {
    if (e) e.preventDefault(); // Prevenir comportamento padrão de rolagem
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || !activeChat) return;
    
    // Converter a imagem para base64 ou fazer upload para um servidor
    let imageUrl: string | undefined = undefined;
    
    if (selectedImage) {
      // Simulação de URL de imagem persistente (em um app real, você iria fazer upload para um servidor)
      // Estamos usando o URL.createObjectObject, que é temporário, apenas para demonstração
      imageUrl = imagePreview || undefined;
    }
    
    // Add user message
    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date(),
      imageUrl
    };
    
    addMessageToChat(activeChat.id, userMessage);
    setInput('');
    handleImageRemove(); // Limpar a imagem após enviar
    
    // Verificar se a API está configurada
    const apiConfigured = isOpenAIConfigured();
    setIsApiConfigured(apiConfigured);
    
    if (!apiConfigured) {
      // Se a API não estiver configurada, usar resposta simulada
      setTimeout(() => {
        const aiResponse: Message = {
          text: "A API da OpenAI não está configurada. Por favor, configure a variável VITE_OPENAI_API_KEY no arquivo .env para utilizar os recursos completos.",
          sender: 'ai',
          timestamp: new Date(),
        };
        if (activeChat) {
          addMessageToChat(activeChat.id, aiResponse);
        }
      }, 500);
      return;
    }
    
    // Mostra indicador de carregamento
    setIsLoading(true);
    
    try {
      // Obter resposta da API com o modo de prompt ativo
      const responseText = await sendMessageToOpenAI(
        [...activeChat.messages, userMessage],
        activeChat.modelId,
        activePromptMode
      );
      
      // Adiciona resposta ao chat
      const aiResponse: Message = {
        text: responseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      if (activeChat) {
        addMessageToChat(activeChat.id, aiResponse);
      }
    } catch (error) {
      console.error('Erro ao obter resposta da OpenAI:', error);
      
      // Mensagem de erro genérica
      const errorResponse: Message = {
        text: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.",
        sender: 'ai',
        timestamp: new Date(),
      };
      
      if (activeChat) {
        addMessageToChat(activeChat.id, errorResponse);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Resposta simulada para quando a API não estiver configurada
  const getAiResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('olá') || input.includes('oi') || input.includes('hey')) {
      return 'Olá! Em que posso ajudar?';
    }
    
    if (input.includes('ajuda') || input.includes('como funciona')) {
      return 'Este é um simulador de post. Você pode adicionar texto, fazer upload de imagens e exportar o post como imagem!';
    }
    
    if (input.includes('obrigado') || input.includes('valeu')) {
      return 'De nada! Estou sempre à disposição.';
    }
    
    return 'Posso ajudar com dicas para seu post. O que você gostaria de saber?';
  };
  
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
  };
  
  const handleModelChange = (value: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault(); // Prevenir comportamento padrão de rolagem
    if (activeChat) {
      updateChat(activeChat.id, {
        ...activeChat,
        modelId: value
      });
    }
  };
  
  const handleChatSelect = (chat: Chat, e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir o comportamento padrão de rolagem
    setActiveChat(chat.id);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };
  
  const handleNewChat = (e?: React.MouseEvent) => {
    if (e) e.preventDefault(); // Prevenir o comportamento padrão de rolagem
    createNewChat();
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };
  
  const handleClearHistory = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir o comportamento padrão de rolagem
    clearAllChats();
    createNewChat();
  };
  
  const handleManualToggleTheme = (e?: React.MouseEvent) => {
    if (e) e.preventDefault(); // Prevenir o comportamento padrão de rolagem
    
    const root = window.document.documentElement;
    const newDarkMode = !isDarkMode;
    
    if (newDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    setIsDarkMode(newDarkMode);
  };
  
  // Manipulador especial para o Switch component
  const handleSwitchToggleTheme = (checked: boolean) => {
    const root = window.document.documentElement;
    
    if (checked) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    setIsDarkMode(checked);
  };
  
  const handleSetPromptMode = (mode: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault(); // Prevenir o comportamento padrão de rolagem
    setActivePromptMode(mode);
  };
  
  // Filtrar e agrupar os chats
  const filteredChats = React.useMemo(() => {
    if (!searchQuery.trim()) return chats;
    
    const query = searchQuery.toLowerCase();
    return chats.filter(chat => 
      chat.title.toLowerCase().includes(query) || 
      chat.messages.some(msg => msg.text.toLowerCase().includes(query))
    );
  }, [chats, searchQuery]);

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
  
  if (!activeChat) {
    return <div className="h-full w-full flex items-center justify-center">Carregando...</div>;
  }
  
  // Determina o tamanho máximo das mensagens com base no tamanho da tela
  const messageMaxWidth = isMobile ? 'max-w-[85%]' : 'max-w-[80%]';
  
  // Modos disponíveis de prompt
  const promptModes = [
    { id: 'default', name: 'Assistente Padrão', icon: Sparkles, description: 'Assistente geral para qualquer pergunta' },
    { id: 'micro-reportagem', name: 'Micro-Reportagem', icon: Newspaper, description: 'Cria micro-reportagens jornalísticas virais' },
  ];
  
  // Função para formatar texto com estilo de markdown simples
  const formatTextWithMarkdown = (text: string) => {
    // Envolvemos em um div para permitir estilos CSS
    return (
      <div className="whitespace-pre-line prose prose-sm dark:prose-invert max-w-none">
        {text.split('\n').map((line, i) => {
          // Verificar se é um título (começa com #)
          if (line.startsWith('# ')) {
            return <h1 key={i} className="text-lg font-bold my-1">{line.substring(2)}</h1>;
          } else if (line.startsWith('## ')) {
            return <h2 key={i} className="text-base font-bold my-1">{line.substring(3)}</h2>;
          } else if (line.startsWith('### ')) {
            return <h3 key={i} className="text-sm font-bold my-1">{line.substring(4)}</h3>;
          }
          
          // Verificar se é item de lista (começa com - ou *)
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return <li key={i} className="ml-4">{formatInlineMarkdown(line.substring(2))}</li>;
          }
          
          // Linha normal
          if (line.trim() === '') {
            return <br key={i} />;
          }
          
          return <p key={i} className="mb-1">{formatInlineMarkdown(line)}</p>;
        })}
      </div>
    );
  };
  
  // Função auxiliar para formatar elementos inline como código, negrito, itálico
  const formatInlineMarkdown = (text: string) => {
    // Destacar código inline com crases
    const parts = text.split('`');
    return parts.map((part, j) => {
      // Se for índice ímpar, então está entre crases (código)
      if (j % 2 === 1) {
        return <code key={j} className="bg-gray-200 dark:bg-gray-700 rounded text-xs px-1 py-0.5">{part}</code>;
      }
      
      // Formatar negrito (entre **)
      const boldParts = part.split('**');
      if (boldParts.length > 1) {
        return (
          <span key={j}>
            {boldParts.map((boldPart, k) => {
              // Se for índice ímpar, então está entre ** (negrito)
              if (k % 2 === 1) {
                return <strong key={k} className="font-bold">{boldPart}</strong>;
              }
              return <span key={k}>{boldPart}</span>;
            })}
          </span>
        );
      }
      
      return <span key={j}>{part}</span>;
    });
  };
  
  return (
    <div className="flex h-full w-full bg-white dark:bg-gray-950 rounded-md overflow-hidden">
      {/* Sidebar com histórico de chat */}
      <div className={`${isSidebarOpen ? 'w-64 sm:w-72' : 'w-0'} transition-all duration-300 overflow-hidden h-full border-r border-gray-200 dark:border-gray-800`}>
        <div className="h-full flex flex-col">
          <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex flex-col gap-2">
            <Button
              onClick={(e) => handleNewChat(e)}
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
                    onClick={(e) => handleNewChat(e)}
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
                      onClick={(e) => handleChatSelect(chat, e)}
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
      </div>
      
      {/* Chat principal */}
      <div className="flex flex-col flex-grow h-full">
        <div className="p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => handleToggleSidebar(e)}
              className="mr-2 h-7 w-7 sm:h-8 sm:w-8"
            >
              {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </Button>
            <MessageCircle size={16} className="text-blue-500 mr-2" />
            <h3 className="font-medium text-gray-800 dark:text-white truncate text-sm sm:text-base">
              {isMobile 
                ? activeChat.title.length > 20 
                  ? activeChat.title.substring(0, 20) + '...' 
                  : activeChat.title
                : activeChat.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-1">
            <TooltipProvider>
              {promptModes.map(mode => (
                <Tooltip key={mode.id}>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant={activePromptMode === mode.id ? "default" : "ghost"}
                      onClick={(e) => handleSetPromptMode(mode.id, e)}
                      className={cn(
                        "h-7 w-7 sm:h-8 sm:w-8",
                        activePromptMode === mode.id 
                          ? "bg-purple-500 text-white hover:bg-purple-600" 
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      )}
                    >
                      <mode.icon size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{mode.name}</p>
                    <p className="text-xs text-gray-500">{mode.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
            
            <div className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors" onClick={(e) => {
              e.preventDefault(); // Prevenir comportamento padrão de rolagem
              setIsSettingsOpen(true);
            }}>
              <Settings size={20} className="text-gray-500 dark:text-gray-400" />
            </div>
            
            {/* Botão para Alternar Tema em Desktop */}
            <div 
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors" 
              onClick={handleManualToggleTheme}
            >
              {isDarkMode ? (
                <Sun size={20} className="text-gray-500 dark:text-gray-400" />
              ) : (
                <Moon size={20} className="text-gray-500 dark:text-gray-400" />
              )}
            </div>
          </div>
        </div>
        
        {activePromptMode !== 'default' && (
          <Alert variant="default" className="m-2 sm:m-3 mb-0 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
            {activePromptMode === 'micro-reportagem' ? 
              <Newspaper className="h-4 w-4 text-blue-600 dark:text-blue-500" /> : 
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-500" />
            }
            <AlertDescription>
              Modo <span className="font-medium">
                {activePromptMode === 'micro-reportagem' ? 'Micro-Reportagem' : activePromptMode}
              </span> ativado
            </AlertDescription>
          </Alert>
        )}
        
        <ScrollArea className="flex-grow p-2 sm:p-4 scrollable-content">
          <div className="flex flex-col space-y-4">
            {activeChat.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2 flex-shrink-0">
                    <Sparkles size={14} className="text-purple-500" />
                  </div>
                )}
                <div
                  className={`${messageMaxWidth} rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-br-sm shadow-sm shadow-purple-200 dark:shadow-purple-900/20'
                      : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-sm shadow-sm text-gray-800 dark:text-white'
                  }`}
                >
                  <div className="p-3 sm:p-4">
                    {/* Exibir imagem se houver */}
                    {msg.imageUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        <img 
                          src={msg.imageUrl} 
                          alt="Imagem enviada" 
                          className="max-w-full h-auto object-cover"
                        />
                      </div>
                    )}
                    
                    {msg.sender === 'user' ? (
                      <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                    ) : (
                      <div className="text-sm leading-relaxed">
                        {formatTextWithMarkdown(msg.text)}
                      </div>
                    )}
                    <span className={`text-[10px] sm:text-xs block text-right mt-2 ${
                      msg.sender === 'user' 
                        ? 'text-white/70'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center ml-2 flex-shrink-0">
                    <MessageCircle size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2 flex-shrink-0">
                  <Sparkles size={14} className="text-purple-500" />
                </div>
                <div className={`${messageMaxWidth} bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 rounded-bl-sm`}>
                  <div className="flex space-x-2 py-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400 dark:bg-purple-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-purple-400 dark:bg-purple-500 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-purple-400 dark:bg-purple-500 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-2 sm:p-3 border-t border-gray-200 dark:border-gray-700">
          {/* Seletor de modelos melhorado */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {llmModels.map((model) => {
              const IconComponent = model.icon || Cpu;
              const isActive = activeChat.modelId === model.id;
              
              return (
                <TooltipProvider key={model.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className={`h-9 px-3 ${
                          isActive 
                            ? "bg-purple-500 text-white hover:bg-purple-600" 
                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                        onClick={(e) => handleModelChange(model.id, e)}
                      >
                        <IconComponent size={14} className="mr-1" />
                        <span className="text-xs">{model.name.replace('GPT-', '')}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{model.name}</p>
                      <p className="text-xs text-gray-500">{model.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
          
          {/* Visualização de imagem, se houver */}
          {imagePreview && (
            <div className="mb-2 relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-32 w-auto object-cover"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-gray-800/70 hover:bg-gray-800/90"
                onClick={(e) => handleImageRemove(e)}
              >
                <X size={12} className="text-white" />
              </Button>
            </div>
          )}
          
          <form onSubmit={handleSend} className="relative">
            <div className="relative flex items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={(e) => e.preventDefault()}
                onClick={(e) => e.stopPropagation()}
                placeholder={selectedImage ? "Adicione um comentário à imagem..." : "Digite sua mensagem..."}
                className="pr-20 py-6 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-full shadow-sm focus-visible:ring-purple-500"
                disabled={isLoading}
              />
              
              {/* Botão de upload de imagem */}
              <div className="absolute right-12">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  ref={fileInputRef}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  size="icon"
                  variant={selectedImage ? "default" : "ghost"}
                  className={`h-8 w-8 rounded-full ${
                    selectedImage 
                      ? "bg-green-500 text-white" 
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                  onClick={(e) => {
                    e.preventDefault(); // Prevenir comportamento padrão de rolagem
                    fileInputRef.current?.click();
                  }}
                  disabled={isLoading}
                >
                  <ImageIcon size={16} />
                </Button>
              </div>
              
              <Button
                type="submit"
                size="icon"
                className={`absolute right-1 h-8 w-8 rounded-full ${
                  (input.trim() || selectedImage) && !isLoading 
                    ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
                disabled={!input.trim() && !selectedImage || isLoading}
              >
                <Send size={14} className={(input.trim() || selectedImage) && !isLoading ? "text-white" : "text-gray-500 dark:text-gray-400"} />
              </Button>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 ml-2">
              {isApiConfigured 
                ? `Usando ${llmModels.find(m => m.id === activeChat.modelId)?.name || activeChat.modelId} | ${activePromptMode === 'default' ? 'Assistente Padrão' : 'Micro-Reportagem'}`
                : 'Configure a variável VITE_OPENAI_API_KEY no arquivo .env para utilizar o chat'
              }
            </p>
          </form>
        </div>
      </div>
      
      {/* Diálogo de Configurações */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
            <DialogDescription>
              Personalize sua experiência de chat
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                <Label htmlFor="theme-mode">Modo Escuro</Label>
              </div>
              <Switch
                id="theme-mode"
                checked={isDarkMode}
                onCheckedChange={handleSwitchToggleTheme}
              />
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-medium text-red-500 dark:text-red-400">Zona de Perigo</h3>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={handleClearHistory}
                >
                  <Trash2 size={16} className="mr-2" />
                  Limpar todo histórico de conversas
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsSettingsOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AiAssistant;
