export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

export interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const sendMessageToOpenRouter = async (
  messages: OpenRouterMessage[],
  model: string = 'openai/gpt-oss-20b:free'
): Promise<string> => {
  const apiKey = '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';
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in your environment variables.');
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Will Pro AI',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: OpenRouterResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenRouter API');
    }

    // Fix per rimuovere spazi e a capo iniziali dalla risposta
    let content = data.choices[0].message.content;
    
    // Rimuovi tutti gli spazi bianchi, a capo e caratteri di whitespace dall'inizio
    content = content.replace(/^\s+/, '');
    
    // Fix specifico per il punto iniziale: rimuovi il punto se è il primo carattere
    if (content.startsWith('.')) {
      content = content.substring(1).trim();
    }
    
    return content;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    throw error;
  }
};