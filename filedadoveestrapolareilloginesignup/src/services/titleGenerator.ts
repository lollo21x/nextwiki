import { sendMessageToOpenRouter, OpenRouterMessage } from './openrouter';

// Function to detect language from text
const detectLanguage = (text: string): string => {
  // Simple language detection based on common words and patterns
  const italianWords = ['il', 'la', 'di', 'che', 'e', 'un', 'una', 'per', 'con', 'come', 'sono', 'hai', 'ho', 'cosa', 'ciao', 'grazie', 'prego', 'bene', 'male', 'molto', 'poco', 'grande', 'piccolo'];
  const englishWords = ['the', 'and', 'of', 'to', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with', 'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your', 'all', 'any', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'];
  const frenchWords = ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus', 'par', 'grand', 'en', 'une', 'être', 'et', 'en', 'avoir', 'que', 'pour'];
  const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'una', 'del', 'todo', 'está', 'muy', 'fue', 'han', 'era', 'sobre', 'mi', 'está', 'entre', 'durante', 'todo', 'esto', 'también', 'antes', 'ahora', 'cada', 'aquí'];
  const germanWords = ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als', 'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach', 'wird', 'bei', 'einer', 'um', 'am', 'sind', 'noch', 'wie', 'einem', 'über', 'einen', 'so', 'zum', 'war', 'haben', 'nur', 'oder', 'aber', 'vor', 'zur', 'bis', 'mehr', 'durch', 'man', 'sein', 'wurde', 'sei', 'in'];

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  let italianCount = 0;
  let englishCount = 0;
  let frenchCount = 0;
  let spanishCount = 0;
  let germanCount = 0;
  
  words.forEach(word => {
    if (italianWords.includes(word)) italianCount++;
    if (englishWords.includes(word)) englishCount++;
    if (frenchWords.includes(word)) frenchCount++;
    if (spanishWords.includes(word)) spanishCount++;
    if (germanWords.includes(word)) germanCount++;
  });
  
  const maxCount = Math.max(italianCount, englishCount, frenchCount, spanishCount, germanCount);
  
  if (maxCount === 0) return 'italian'; // Default to Italian
  
  if (italianCount === maxCount) return 'italian';
  if (englishCount === maxCount) return 'english';
  if (frenchCount === maxCount) return 'french';
  if (spanishCount === maxCount) return 'spanish';
  if (germanCount === maxCount) return 'german';
  
  return 'italian'; // Default fallback
};

export const generateChatTitle = async (firstUserMessage: string): Promise<string> => {
  try {
    const detectedLanguage = detectLanguage(firstUserMessage);
    
    let systemPrompt = '';
    let userPrompt = '';
    
    switch (detectedLanguage) {
      case 'italian':
        systemPrompt = 'Sei un generatore di titoli. Analizza il contesto del primo messaggio dell\'utente e genera un titolo breve e descrittivo per una conversazione chat. Il titolo deve essere di massimo 3-4 parole. Rispondi solo con il titolo, senza testo aggiuntivo o punteggiatura.';
        userPrompt = `Analizza questo messaggio e genera un titolo di massimo 3-4 parole: "${firstUserMessage}"`;
        break;
      case 'english':
        systemPrompt = 'You are a title generator. Analyze the context of the user\'s first message and generate a short, descriptive title for a chat conversation. The title must be maximum 3-4 words. Respond only with the title, no additional text or punctuation.';
        userPrompt = `Analyze this message and generate a title of maximum 3-4 words: "${firstUserMessage}"`;
        break;
      case 'french':
        systemPrompt = 'Vous êtes un générateur de titres. Analysez le contexte du premier message de l\'utilisateur et générez un titre court et descriptif pour une conversation de chat. Le titre doit contenir maximum 3-4 mots. Répondez uniquement avec le titre, sans texte supplémentaire ni ponctuation.';
        userPrompt = `Analysez ce message et générez un titre de maximum 3-4 mots: "${firstUserMessage}"`;
        break;
      case 'spanish':
        systemPrompt = 'Eres un generador de títulos. Analiza el contexto del primer mensaje del usuario y genera un título corto y descriptivo para una conversación de chat. El título debe tener máximo 3-4 palabras. Responde solo con el título, sin texto adicional ni puntuación.';
        userPrompt = `Analiza este mensaje y genera un título de máximo 3-4 palabras: "${firstUserMessage}"`;
        break;
      case 'german':
        systemPrompt = 'Sie sind ein Titelgenerator. Analysieren Sie den Kontext der ersten Nachricht des Benutzers und erstellen Sie einen kurzen, beschreibenden Titel für ein Chat-Gespräch. Der Titel muss maximal 3-4 Wörter haben. Antworten Sie nur mit dem Titel, ohne zusätzlichen Text oder Interpunktion.';
        userPrompt = `Analysieren Sie diese Nachricht und erstellen Sie einen Titel von maximal 3-4 Wörtern: "${firstUserMessage}"`;
        break;
      default:
        systemPrompt = 'Sei un generatore di titoli. Analizza il contesto del primo messaggio dell\'utente e genera un titolo breve e descrittivo per una conversazione chat. Il titolo deve essere di massimo 3-4 parole. Rispondi solo con il titolo, senza testo aggiuntivo o punteggiatura.';
        userPrompt = `Analizza questo messaggio e genera un titolo di massimo 3-4 parole: "${firstUserMessage}"`;
    }

    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ];

    // Use Gemma 3 for title generation
    const response = await sendMessageToOpenRouter(messages, 'google/gemma-3-27b-it:free');
    
    // Clean up the response and ensure it's within limits
    const title = response.trim().replace(/['"]/g, '');
    const words = title.split(' ').filter(word => word.length > 0);
    
    // Ensure title is between 1-4 words
    if (words.length > 4) {
      return words.slice(0, 4).join(' ');
    }
    
    return words.length > 0 ? words.join(' ') : (detectedLanguage === 'italian' ? 'Nuova Chat' : 'New Chat');
  } catch (error) {
    console.error('Error generating chat title:', error);
    const words = firstUserMessage.split(' ').slice(0, 3);
    return words.length > 0 ? words.join(' ') : 'New Chat';
  }
};