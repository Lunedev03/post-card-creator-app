
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send } from 'lucide-react';

type Message = {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

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
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <MessageCircle size={18} className="text-blue-500" />
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
                    ? 'bg-blue-500 text-white rounded-br-none'
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
      
      <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
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
        </div>
      </form>
    </div>
  );
};

export default AiAssistant;
