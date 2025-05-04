import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, ChevronLeft, ChevronRight, Plus, Search, Settings, Trash2, X, Moon, Sun, AlertTriangle, Newspaper, Sparkles } from 'lucide-react';
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
};

const llmModels: LLMModel[] = [
  { 
    id: 'gpt-3.5-turbo', 
    name: 'GPT-3.5 Turbo',
    description: 'Rápido e econômico para tarefas comuns'
  },
  { 
    id: 'gpt-3.5-turbo-16k', 
    name: 'GPT-3.5 Turbo (16K)',
    description: 'Suporta contextos mais longos de até 16K tokens'
  },
  { 
    id: 'gpt-4o', 
    name: 'GPT-4o',
    description: 'Modelo mais avançado da OpenAI, com alta capacidade de raciocínio'
  },
  { 
    id: 'gpt-4o-mini', 
    name: 'GPT-4o Mini',
    description: 'Versão mais rápida e econômica do GPT-4o' 
  },
  { 
    id: 'gpt-4-turbo', 
    name: 'GPT-4 Turbo',
    description: 'Modelo avançado com conhecimento até abril de 2023'
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
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [activePromptMode, setActivePromptMode] = useState<string>('default');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;
    
    // Add user message
    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    addMessageToChat(activeChat.id, userMessage);
    setInput('');
    
    // Verificar novamente se a API está configurada
    const apiConfigured = isOpenAIConfigured();
    setIsApiConfigured(apiConfigured);
    
    if (!apiConfigured) {
      // Se a API não estiver configurada, usar resposta simulada
      setTimeout(() => {
        const aiResponse: Message = {
          text: "A API da OpenAI não está configurada. Defina VITE_OPENAI_API_KEY no seu arquivo .env ou configure nas configurações.",
          sender: 'ai',
          timestamp: new Date(),
        };
        if (activeChat) {
          addMessageToChat(activeChat.id, aiResponse);
        }
      }, 500);
      
      // Abrir diálogo de configuração automaticamente
      setApiKeyDialogOpen(true);
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
      
      // Verifica se é erro de chave de API
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const isApiKeyError = errorMessage.includes('API') || errorMessage.includes('key') || errorMessage.includes('chave');
      
      if (isApiKeyError) {
        // Se for erro de chave, atualiza o estado e abre o diálogo
        setIsApiConfigured(false);
        setApiKeyDialogOpen(true);
        
        // Mensagem específica para erro de API
        const aiResponse: Message = {
          text: "Erro na chave da API OpenAI. Por favor, verifique sua chave nas configurações.",
          sender: 'ai',
          timestamp: new Date(),
        };
        
        if (activeChat) {
          addMessageToChat(activeChat.id, aiResponse);
        }
      } else {
        // Mensagem de erro genérica
        const errorResponse: Message = {
          text: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.",
          sender: 'ai',
          timestamp: new Date(),
        };
        
        if (activeChat) {
          addMessageToChat(activeChat.id, errorResponse);
        }
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
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleModelChange = (value: string) => {
    if (activeChat) {
      updateChat(activeChat.id, { modelId: value });
      
      // Add system message about model change
      const modelName = llmModels.find(m => m.id === value)?.name || value;
      const systemMessage: Message = {
        text: `Modelo alterado para ${modelName}`,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      addMessageToChat(activeChat.id, systemMessage);
    }
  };
  
  const handleChatSelect = (chat: Chat) => {
    setActiveChat(chat);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };
  
  const handleNewChat = () => {
    const newChat = createNewChat();
    if (isMobile) {
      setIsSidebarOpen(false);
    }
    return newChat;
  };
  
  const handleClearHistory = () => {
    clearAllChats();
    setIsSettingsOpen(false);
  };
  
  const handleToggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  const handleSaveApiKey = () => {
    // Em um ambiente real, isso precisaria ser feito pelo servidor
    // Esta é apenas uma implementação temporária para fins de demonstração
    if (typeof window !== 'undefined' && apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey);
      setIsApiConfigured(true);
      setApiKeyDialogOpen(false);
      
      // Adicionar mensagem ao chat informando que a API foi configurada
      if (activeChat) {
        const systemMessage: Message = {
          text: "Chave de API configurada com sucesso! Agora você pode usar os modelos da OpenAI.",
          sender: 'ai',
          timestamp: new Date(),
        };
        addMessageToChat(activeChat.id, systemMessage);
      }
    }
  };
  
  const handleSetPromptMode = (mode: string) => {
    setActivePromptMode(mode);
    
    if (activeChat && mode !== 'default') {
      // Adicionar mensagem informativa quando o modo é alterado
      const modeMessages: Record<string, string> = {
        'micro-reportagem': 'Modo de micro-reportagem jornalística ativado! Descreva um evento, pessoa ou situação para que eu crie uma micro-reportagem viral.'
      };
      
      const message = modeMessages[mode] || `Modo ${mode} ativado!`;
      
      const systemMessage: Message = {
        text: message,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      addMessageToChat(activeChat.id, systemMessage);
    }
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
  
  return (
    <div className="flex h-full w-full bg-white dark:bg-gray-950 rounded-md overflow-hidden">
      {/* Sidebar com histórico de chat */}
      <div className={`${isSidebarOpen ? 'w-64 sm:w-72' : 'w-0'} transition-all duration-300 overflow-hidden h-full border-r border-gray-200 dark:border-gray-800`}>
        <div className="h-full flex flex-col">
          <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex flex-col gap-2">
            <Button
              onClick={handleNewChat}
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
                      onClick={() => handleChatSelect(chat)}
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
              onClick={handleToggleSidebar}
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
                      onClick={() => handleSetPromptMode(mode.id)}
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
            
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsSettingsOpen(true)}
              className="h-7 w-7 sm:h-8 sm:w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Settings size={16} />
            </Button>
          </div>
        </div>
        
        {!isApiConfigured && (
          <Alert variant="default" className="m-2 sm:m-3 mb-0 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <AlertDescription>
              API da OpenAI não configurada. Configure nas <Button variant="link" className="p-0 h-auto text-amber-600 dark:text-amber-400" onClick={() => setIsSettingsOpen(true)}>configurações</Button>.
            </AlertDescription>
          </Alert>
        )}
        
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
        
        <ScrollArea className="flex-grow p-2 sm:p-3">
          <div className="flex flex-col space-y-2 sm:space-y-3">
            {activeChat.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`${messageMaxWidth} rounded-lg p-2 sm:p-3 ${
                    msg.sender === 'user'
                      ? 'bg-purple-500 text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-gray-800 rounded-bl-none text-gray-800 dark:text-white'
                  }`}
                >
                  <p className="text-xs sm:text-sm whitespace-pre-line">{msg.text}</p>
                  <span className={`text-[10px] sm:text-xs block text-right mt-1 ${
                    msg.sender === 'user' 
                      ? 'text-white/70'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`${messageMaxWidth} bg-gray-100 dark:bg-gray-800 rounded-lg p-3 rounded-bl-none`}>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-2 sm:p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Select value={activeChat.modelId} onValueChange={handleModelChange}>
              <SelectTrigger className="h-7 sm:h-8 text-xs bg-gray-50 dark:bg-gray-900">
                <SelectValue placeholder="Selecionar modelo" />
              </SelectTrigger>
              <SelectContent>
                {llmModels.map((model) => (
                  <SelectItem 
                    key={model.id} 
                    value={model.id} 
                    className="text-xs sm:text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      {model.description && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {model.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activePromptMode === 'micro-reportagem' 
                ? "Descreva um evento ou pessoa para criar uma micro-reportagem..." 
                : "Escreva uma mensagem..."}
              className="flex-grow h-8 sm:h-9 text-xs sm:text-sm"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading} 
              className="bg-purple-500 hover:bg-purple-600 h-8 sm:h-9 w-8 sm:w-9"
              size="icon"
            >
              <Send size={16} />
            </Button>
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
                onCheckedChange={handleToggleTheme}
              />
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-medium mb-2">API OpenAI</h3>
              <Button 
                variant="outline" 
                className="w-full justify-start mb-2"
                onClick={() => setApiKeyDialogOpen(true)}
              >
                {isApiConfigured ? "Trocar chave da API" : "Configurar chave da API"}
              </Button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                É necessário configurar uma chave de API da OpenAI para usar os recursos de chat.
              </p>
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
      
      {/* Diálogo para configurar a chave da API */}
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar API da OpenAI</DialogTitle>
            <DialogDescription>
              Insira sua chave de API da OpenAI para habilitar o chat.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="api-key" className="mb-2 block">Chave de API</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mb-2"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Obtenha sua chave em <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">platform.openai.com</a>
            </p>
            <Alert variant="default" className="mt-4 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <AlertDescription className="text-xs">
                Esta é uma implementação simplificada para fins de demonstração. Em um ambiente de produção, nunca armazene a chave da API no navegador.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApiKeyDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveApiKey} disabled={!apiKey.startsWith('sk-')}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AiAssistant;
