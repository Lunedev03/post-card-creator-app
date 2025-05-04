import React, { useEffect, useState } from 'react';
import { eventLogger, EventLoggerEventDetails } from '@/utils/eventLogger';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Bug, RefreshCw } from 'lucide-react';

interface ButtonDebuggerProps {
  onClose?: () => void;
}

interface EventLoggerEvent {
  timestamp: number;
  type: string;
  details?: EventLoggerEventDetails;
}

const ButtonDebugger: React.FC<ButtonDebuggerProps> = ({ onClose }) => {
  const [events, setEvents] = useState<EventLoggerEvent[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  
  useEffect(() => {
    // Obter eventos iniciais
    setEvents(eventLogger.getEvents());
    
    // Atualizar eventos a cada 1 segundo
    const intervalId = setInterval(() => {
      setEvents(eventLogger.getEvents());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const clearLogs = () => {
    eventLogger.clear();
    setEvents([]);
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  // Filtrar apenas eventos de botões
  const buttonEvents = events.filter(
    e => e.type === 'ButtonClick' || e.type.includes('toggle')
  );
  
  // Mostrar apenas os 10 eventos mais recentes
  const recentEvents = [...buttonEvents].reverse().slice(0, 10);
  
  // Função para forçar cliques nos botões para teste
  const simulateButtonClick = (id: string) => {
    console.log(`Simulando clique no botão ${id}`);
    const button = document.getElementById(id);
    if (button) {
      button.click();
    } else {
      console.error(`Botão com ID ${id} não encontrado`);
    }
  };
  
  return (
    <Card 
      className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-950 shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
      style={{ 
        width: isMinimized ? '120px' : '350px',
        maxHeight: isMinimized ? '40px' : '400px'
      }}
    >
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Bug size={18} className="text-purple-500" />
          <h3 className="text-sm font-medium">Depurador de Botões</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={toggleMinimize}
          >
            {isMinimized ? <RefreshCw size={14} /> : <Bug size={14} />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={onClose}
          >
            <X size={14} />
          </Button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <div className="p-2 max-h-[300px] overflow-y-auto">
            <div className="text-xs mb-2 font-bold">Eventos recentes:</div>
            {recentEvents.length > 0 ? (
              <ul className="space-y-1">
                {recentEvents.map((event, i) => (
                  <li key={i} className="text-xs p-1 bg-gray-50 dark:bg-gray-900 rounded">
                    <span className="font-semibold">{event.type}:</span>
                    {event.type === 'ButtonClick' && (
                      <span className="ml-1">
                        {String(event.details?.ariaLabel || event.details?.text || 'Botão sem texto')}
                      </span>
                    )}
                    {event.type.includes('toggle') && (
                      <span className="ml-1">
                        {event.details?.previous !== undefined ? 
                          `${String(event.details.previous)} → ${String(event.details.new)}` : 
                          'Estado alterado'}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-gray-500">Nenhum evento de botão registrado ainda.</div>
            )}
          </div>
          
          <div className="p-2 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs mb-2 font-bold">Teste manual:</div>
            <div className="flex gap-2 mb-2">
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs h-8"
                onClick={() => simulateButtonClick('emoji-picker-button')}
              >
                Abrir/Fechar Emoji
              </Button>
              <Button 
                size="sm"
                variant="outline"
                className="text-xs h-8"
                onClick={() => simulateButtonClick('ai-assistant-button')}
              >
                Abrir/Fechar IA
              </Button>
            </div>
            <Button 
              size="sm"
              variant="ghost"
              className="text-xs h-7 w-full"
              onClick={clearLogs}
            >
              Limpar logs
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default ButtonDebugger; 