import OpenAI from 'openai';
import { Message } from '@/contexts/ChatHistoryContext';

// Obter a chave da API - primeiro tenta variável de ambiente, depois localStorage
const getApiKey = (): string | undefined => {
  // Tenta obter da variável de ambiente
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (envKey) return envKey;
  
  // Se não encontrar, tenta obter do localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('openai_api_key') || undefined;
  }
  
  return undefined;
};

// Criar cliente OpenAI sob demanda, apenas quando houver uma chave
const createOpenAIClient = () => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('Chave da API OpenAI não configurada. Configure a chave nas configurações ou no arquivo .env');
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
  const convertedMessages = messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text
  } as OpenAIMessage));
  
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

// Enviar mensagens para a API da OpenAI e obter resposta
export const sendMessageToOpenAI = async (
  messages: Message[], 
  modelId: string = 'gpt-3.5-turbo',
  promptMode?: string
): Promise<string> => {
  try {
    // Criar cliente OpenAI apenas quando necessário
    const openai = createOpenAIClient();
    
    // Detectar modo do prompt automaticamente se não especificado
    const detectedMode = promptMode || detectPromptMode(messages);
    
    const openAIMessages = convertToOpenAIMessages(messages, detectedMode);
    
    // Os IDs já estão alinhados com os nomes da API da OpenAI
    // Não é necessário fazer mapeamento, exceto para alguns casos específicos
    let apiModelId = modelId;
    
    // Verificações de segurança para garantir que o modelo exista
    const validModels = [
      'gpt-3.5-turbo', 
      'gpt-3.5-turbo-16k',
      'gpt-4o', 
      'gpt-4o-mini',
      'gpt-4-turbo'
    ];
    
    // Se o modelo não estiver na lista de válidos, use o padrão
    if (!validModels.includes(apiModelId)) {
      console.warn(`Modelo ${modelId} não reconhecido, usando gpt-3.5-turbo como fallback`);
      apiModelId = 'gpt-3.5-turbo';
    }
    
    const response = await openai.chat.completions.create({
      model: apiModelId,
      messages: openAIMessages,
      temperature: 0.7,
      max_tokens: 1000, // Aumentar para acomodar respostas mais longas
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    
    return response.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
  } catch (error) {
    console.error('Erro ao chamar a API da OpenAI:', error);
    return 'Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.';
  }
};

// Verificar se a chave API está configurada
export const isOpenAIConfigured = (): boolean => {
  return !!getApiKey();
}; 