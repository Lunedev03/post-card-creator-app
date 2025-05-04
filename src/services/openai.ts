import OpenAI from 'openai';
import { Message } from '@/contexts/ChatHistoryContext';

// Interface para erros específicos da API
interface OpenAIErrorResponse {
  error?: {
    message: string;
    type: string;
    param: string | null;
    code: string;
  };
}

// Obter a chave da API - apenas da variável de ambiente
const getApiKey = (): string | undefined => {
  // Obter da variável de ambiente
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  return envKey;
};

// Criar cliente OpenAI sob demanda, apenas quando houver uma chave
const createOpenAIClient = () => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('Chave da API OpenAI não configurada. Configure a variável VITE_OPENAI_API_KEY no arquivo .env');
  }
  
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Permitir uso no navegador (em produção, use um backend)
  });
};

// Interface para histórico de mensagens no formato OpenAI
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Prompts especializados por modo
const specializedPrompts: Record<string, string> = {
  'default': 'Você é um assistente amigável e prestativo que ajuda os usuários a criar posts para redes sociais.',
  
  'micro-reportagem': `✅ ATUE COMO JORNALISTA ESPECIALIZADO EM MICRO-REPORTAGENS VIRAIS
Você é um jornalista especializado em contar histórias reais e marcantes em formato de micro-reportagem emocional e envolvente, voltado para plataformas como Reels, Shorts e TikTok.

🎯 Objetivo:
Criar textos com até 12 linhas, começando com o nome e idade da pessoa, desenvolvendo um mini-relato com emoção, contexto e virada, escrito em tom jornalístico popular e visualmente fluido.

📌 Instruções principais:
- Comece com o nome e idade da pessoa central da história (ex: "Clay Cook, 31 anos...").
- Desenvolva o texto com até 12 linhas, usando frases curtas e objetivas, que carreguem emoção e contexto.
- Apresente o fato marcante ou inusitado como um ponto de virada dramático ou inspirador.
- Crie tensão ou curiosidade, conduzindo o leitor até uma conclusão parcial ou um gancho emocional.
- Use linguagem popular, visual e fluída — como uma boa matéria de revista ou TV.
- Evite narrar tudo: mantenha um ponto aberto ou algo que instigue comentário.

📋 Estrutura da resposta:
1. Título chamativo (com emojis opcionais)
2. Texto com até 12 linhas
   - Inicie com nome e idade
   - Desenvolva com frases curtas
   - Use ritmo que mistura contexto e emoção
   - Termine com impacto ou gancho emocional
3. Descrição curta (1-2 frases provocativas)
4. Sugestão de imagem para fundo

❌ Não use linguagem técnica ou formal. Não exagere com adjetivos. Mantenha o tom jornalístico-popular. Guarde sempre uma emoção para o final.`
};

// Converter mensagens do contexto para formato OpenAI
const convertToOpenAIMessages = (messages: Message[], promptMode: string = 'default'): OpenAIMessage[] => {
  // Obtém o prompt especializado ou usa o padrão se não existir
  const systemPrompt = specializedPrompts[promptMode] || specializedPrompts['default'];
  
  // Adiciona uma mensagem de sistema no início para instruir o modelo
  const systemMessage: OpenAIMessage = {
    role: 'system',
    content: systemPrompt
  };
  
  // Converte as mensagens do chat para o formato da OpenAI
  const convertedMessages = messages.map(msg => {
    // Se a mensagem tiver uma imagem, informar no texto
    const content = msg.imageUrl 
      ? `${msg.text || ''}\n\n[Imagem anexada pelo usuário]` 
      : msg.text;
      
    return {
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content
    } as OpenAIMessage;
  });
  
  return [systemMessage, ...convertedMessages];
};

// Detectar comandos especiais nas mensagens do usuário
const detectPromptMode = (messages: Message[]): string => {
  // Verificar a última mensagem do usuário
  const lastUserMessage = [...messages].reverse().find(msg => msg.sender === 'user');
  
  if (!lastUserMessage) return 'default';
  
  // Detecção de padrões específicos nas mensagens
  const text = lastUserMessage.text.toLowerCase();
  
  if (text.includes('/micro-reportagem') || 
      text.includes('micro reportagem') || 
      text.includes('reportagem viral') ||
      text.includes('formato jornalístico')) {
    return 'micro-reportagem';
  }
  
  return 'default';
};

// Implementação do backoff exponencial para novas tentativas
const retryWithExponentialBackoff = async <T>(
  fn: () => Promise<T>,
  initialDelay = 1000,
  maxRetries = 3
): Promise<T> => {
  let retries = 0;
  let delay = initialDelay;
  
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      retries++;
      
      // Verificar se atingiu o número máximo de tentativas
      if (retries > maxRetries) {
        throw error;
      }
      
      // Verificar se é um erro de limite de taxa
      const isRateLimitError = 
        error.status === 429 || 
        (error.error?.type === 'insufficient_quota') ||
        (error.message && error.message.includes('rate limit')) ||
        (error.message && error.message.includes('quota'));
      
      // Se não for um erro de taxa, não tente novamente
      if (!isRateLimitError) {
        throw error;
      }
      
      console.warn(`Erro de limite de taxa na tentativa ${retries}. Tentando novamente em ${delay}ms`);
      
      // Esperar pelo tempo de delay antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Aumentar o tempo de espera para a próxima tentativa (backoff exponencial)
      delay *= 2;
    }
  }
};

// Fallback para modelos alternativos em caso de erro
const getFallbackModel = (originalModel: string): string => {
  const fallbackMap: Record<string, string> = {
    'gpt-4o': 'gpt-4o-mini',
    'gpt-4o-mini': 'gpt-3.5-turbo',
    'gpt-4-turbo': 'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k': 'gpt-3.5-turbo',
  };
  
  return fallbackMap[originalModel] || 'gpt-3.5-turbo';
};

// Enviar mensagens para a API da OpenAI e obter resposta
export const sendMessageToOpenAI = async (
  messages: Message[], 
  modelId: string = 'gpt-3.5-turbo',
  promptMode?: string
): Promise<string> => {
  // Verificações de segurança para garantir que o modelo exista
  const validModels = [
    'gpt-3.5-turbo', 
    'gpt-3.5-turbo-16k',
    'gpt-4o', 
    'gpt-4o-mini',
    'gpt-4-turbo'
  ];
  
  // Se o modelo não estiver na lista de válidos, use o padrão
  let apiModelId = modelId;
  if (!validModels.includes(apiModelId)) {
    console.warn(`Modelo ${modelId} não reconhecido, usando gpt-3.5-turbo como fallback`);
    apiModelId = 'gpt-3.5-turbo';
  }
  
  // Detectar modo do prompt automaticamente se não especificado
  const detectedMode = promptMode || detectPromptMode(messages);
  const openAIMessages = convertToOpenAIMessages(messages, detectedMode);
  
  try {
    // Tentar fazer a requisição com backoff exponencial
    return await retryWithExponentialBackoff(async () => {
      // Criar cliente OpenAI apenas quando necessário
      const openai = createOpenAIClient();
      
      const response = await openai.chat.completions.create({
        model: apiModelId,
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 1000, // Aumentar para acomodar respostas mais longas
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }) as OpenAI.Chat.Completions.ChatCompletion;
      
      return response.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
    });
  } catch (error: any) {
    console.error('Erro ao chamar a API da OpenAI:', error);
    
    // Verificar se o erro é relacionado à chave da API
    if (
      error.message?.includes('api_key') || 
      error.message?.includes('API key') || 
      error.message?.includes('Authentication')
    ) {
      return 'Erro de autenticação com a API da OpenAI. Configure a variável VITE_OPENAI_API_KEY no arquivo .env.';
    }
    
    // Tentar usar um modelo alternativo em caso de erro persistente
    try {
      console.warn(`Tentando com modelo alternativo: ${getFallbackModel(apiModelId)}`);
      
      // Criar cliente OpenAI apenas quando necessário
      const openai = createOpenAIClient();
      
      const response = await openai.chat.completions.create({
        model: getFallbackModel(apiModelId),
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }) as OpenAI.Chat.Completions.ChatCompletion;
      
      return response.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
    } catch (fallbackError) {
      console.error('Erro ao usar modelo alternativo:', fallbackError);
      return 'Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.';
    }
  }
};

// Verificar se a chave API está configurada
export const isOpenAIConfigured = (): boolean => {
  return !!getApiKey();
};

export const createMessagesPayload = (
  messageHistory: Message[],
  systemMessage?: string
): Array<OpenAI.Chat.ChatCompletionMessageParam> => {
  // ... existing code ...
}; 