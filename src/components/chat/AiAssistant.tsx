
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

type Message = {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

type LLMModel = {
  id: string;
  name: string;
};

const llmModels: LLMModel[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4.5-preview', name: 'GPT-4.5 Preview' },
  { id: 'llama-3.1-8b', name: 'Llama 3.1 (8B)' },
  { id: 'llama-3.1-70b', name: 'Llama 3.1 (70B)' },
];

const initialMessages: Message[] = [
  {
    text: 'Olá! Como posso ajudar você hoje?',
    sender: 'ai',
    timestamp: new Date(),
  },
];

const AiAssistant = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse: Message = {
        text: getAiResponse(input),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };
  
  // Simple response logic for demo purposes
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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    
    // Add system message about model change
    const modelName = llmModels.find(m => m.id === value)?.name || value;
    setMessages(prev => [
      ...prev,
      {
        text: `Modelo alterado para ${modelName}`,
        sender: 'ai',
        timestamp: new Date(),
      }
    ]);
  };
  
  return (
    <div className="flex flex-col h-[500px]">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <MessageCircle size={18} className="text-blue-500 mr-2" />
        <h3 className="font-medium text-gray-800 dark:text-white">Assistente IA</h3>
      </div>
      
      <ScrollArea className="flex-grow p-3">
        <div className="flex flex-col space-y-3">
          {messages.map((msg, index) => (
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
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger className="h-8 text-xs bg-gray-50 dark:bg-gray-900">
              <SelectValue placeholder="Selecionar modelo" />
            </SelectTrigger>
            <SelectContent>
              {llmModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escreva uma mensagem..."
            className="flex-grow"
          />
          <Button 
            type="submit" 
            disabled={!input.trim()} 
            className="bg-purple-500 hover:bg-purple-600"
            size="icon"
          >
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistant;
