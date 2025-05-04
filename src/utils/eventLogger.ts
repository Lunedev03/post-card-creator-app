/**
 * Utilitário para monitorar eventos e ajudar na depuração
 * Útil para verificar se eventos de clique estão sendo disparados corretamente
 */

export type EventLoggerEventDetails = Record<string, unknown>;

export class EventLogger {
  private static instance: EventLogger;
  private events: { timestamp: number; type: string; details?: EventLoggerEventDetails }[] = [];
  private enabled: boolean = true;

  private constructor() {}

  public static getInstance(): EventLogger {
    if (!EventLogger.instance) {
      EventLogger.instance = new EventLogger();
    }
    return EventLogger.instance;
  }

  public log(type: string, details?: EventLoggerEventDetails): void {
    if (!this.enabled) return;
    
    console.log(`[EventLogger] ${type}`, details);
    this.events.push({
      timestamp: Date.now(),
      type,
      details
    });
    
    // Limitar o tamanho do histórico
    if (this.events.length > 100) {
      this.events.shift();
    }
  }

  public getEvents(): { timestamp: number; type: string; details?: EventLoggerEventDetails }[] {
    return [...this.events];
  }

  public clear(): void {
    this.events = [];
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }

  public monitorClickEvents(elementId: string, eventName: string): void {
    if (typeof document === 'undefined') return;
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`[EventLogger] Element with ID ${elementId} not found`);
      return;
    }
    
    element.addEventListener('click', (e) => {
      this.log(eventName, {
        target: e.target,
        currentTarget: e.currentTarget,
        timestamp: new Date().toISOString()
      });
    });
  }

  public monitorButtonClicks(): void {
    if (typeof document === 'undefined') return;
    
    // Monitorar todos os botões
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button');
      
      if (button) {
        const text = button.textContent || '';
        const ariaLabel = button.getAttribute('aria-label') || '';
        
        this.log('ButtonClick', {
          button: button,
          text: text.trim(),
          ariaLabel,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    console.log('[EventLogger] Monitoring all button clicks');
  }
}

// Exportar uma instância única
export const eventLogger = EventLogger.getInstance();

// Ativar monitoramento de botões automaticamente
if (typeof document !== 'undefined') {
  setTimeout(() => {
    eventLogger.monitorButtonClicks();
    console.log('[EventLogger] Button click monitoring activated');
  }, 1000);
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogEvent = {
  scope: string;
  event: string;
  message: string;
  level: LogLevel;
  timestamp: Date;
  data?: Record<string, unknown>;
  requestId?: string;
};

export const logEvent = (
  scope: string, 
  event: string, 
  level: LogLevel = 'info', 
  data?: Record<string, unknown>
): void => {
  // ... existing code ...
}

export const captureException = (
  error: Error, 
  scope: string, 
  additionalData?: Record<string, unknown>
): void => {
  // ... existing code ...
} 