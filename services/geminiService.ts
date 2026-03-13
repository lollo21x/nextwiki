/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { LanguageCode, languageNameMap } from '../utils/translations';

// --- OpenRouter Configuration ---
export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const OPENROUTER_API_KEY = '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';
// --- End OpenRouter Configuration ---

// --- Pexels Configuration for Images ---
const PEXELS_API_KEY = 'P0JY9qNicegGHGtqSUzvvgXuqYKJz5VSfLcjDUeMk0V4BB3S5yVkwGZg';
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';
// --- End Image Configuration ---

export type GenerationMode = 'encyclopedia' | 'eli5' | 'practicalExamples' | 'stepByStep' | 'summary' | 'funFacts';

const getPromptForMode = (topic: string, language: LanguageCode, mode: GenerationMode): string => {
  const fullLanguageName = languageNameMap[language] || 'English';
  const commonInstructions = `The response must be in ${fullLanguageName}. Be informative. Do not use markdown, titles, or any special formatting. Respond with only the text of the response itself.`;

  switch (mode) {
    case 'eli5':
      return `Explain the term "${topic}" in 2-3 simple sentences, with common words, as if you were explaining it to a 5-year-old child. ${commonInstructions}`;
    case 'practicalExamples':
      return `Provide a concise explanation of "${topic}" (around 3-4 sentences) focused on its practical applications and real-world examples. ${commonInstructions}`;
    case 'stepByStep':
      return `Explain how "${topic}" works or is done in a maximum of 5 clear, sequential steps. Start each step on a new line with a number (1., 2., 3., ...). ${commonInstructions}`;
    case 'summary':
      return `Provide a schematic summary of the key points for "${topic}". Present it as a short, unordered list of 3-5 points. Start each point on a new line with a bullet point (·). ${commonInstructions}`;
    case 'funFacts':
      return `Provide a short, unordered list of 3-5 interesting and little-known fun facts about "${topic}". Start each fact on a new line with a bullet point (·). ${commonInstructions}`;
    case 'encyclopedia':
    default:
      return `Provide a concise (around 4-6 sentences), technical, precise, and complete encyclopedia-style single-paragraph definition for the term: "${topic}". Be neutral. ${commonInstructions}`;
  }
};

/**
 * Streams a definition for a given topic from the OpenRouter API.
 * @param topic The word or term to define.
 * @param language The language for the response.
 * @param mode The generation mode for the content.
 * @returns An async generator that yields text chunks of the definition.
 */
export async function* streamDefinition(
  topic: string,
  language: LanguageCode,
  mode: GenerationMode,
): AsyncGenerator<string, void, undefined> {
  const prompt = getPromptForMode(topic, language, mode);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Could not get response body reader.');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.substring(6);
          if (jsonStr === '[DONE]') {
            return;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            console.error('Failed to parse stream chunk:', jsonStr, e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error streaming from OpenRouter:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    yield `Error: Could not generate content for "${topic}". ${errorMessage}`;
  }
}

/**
 * Translates a query to English using MyMemory API with a 5-second timeout.
 * Falls back to the original query on timeout or error.
 */
async function translateWithMyMemory(query: string, langCode: LanguageCode): Promise<string> {
  // No translation needed if already English
  if (langCode === 'en') return query;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=${langCode}|en`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`MyMemory API returned status ${response.status}, using original query.`);
      return query;
    }

    const data = await response.json();
    if (data.responseStatus !== 200 || !data.responseData?.translatedText) {
      console.warn('MyMemory: unexpected response, using original query.');
      return query;
    }

    const translated = data.responseData.translatedText;
    console.log(`MyMemory translated "${query}" (${langCode}) → "${translated}" (en)`);
    return translated;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn('MyMemory API timeout (5s), using original query as fallback.');
    } else {
      console.warn('MyMemory API error, using original query as fallback:', error);
    }
    return query;
  }
}

/**
 * Fetches an image for a given topic from the Pexels API.
 * Translates the query to English via MyMemory first (with 5s timeout fallback).
 * @param topic The topic to search for an image.
 * @param language The current app language for translation.
 * @returns A promise that resolves to a URL of the image.
 */
export async function generateImage(topic: string, language: LanguageCode = 'en'): Promise<string> {
  // Step 1: Translate to English via MyMemory
  const translatedQuery = await translateWithMyMemory(topic, language);

  // Step 2: Search Pexels with the (translated) query
  const url = `${PEXELS_API_URL}?query=${encodeURIComponent(translatedQuery)}&per_page=15&orientation=landscape`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': PEXELS_API_KEY,
      },
    });

    if (!response.ok) {
      const responseText = await response.text();
      // Pexels might return plain text for auth errors
      if (response.status === 401) {
        throw new Error(`Pexels API Error: Authentication failed. Please check your API key.`);
      }
      throw new Error(`Pexels API Error: ${response.status} ${responseText}`);
    }

    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
      console.warn(`No image found on Pexels for "${translatedQuery}".`);
      throw new Error(`No image found for "${topic}".`);
    }

    // Use the landscape version for the 16:9 container
    const imageUrl = data.photos[0].src.landscape;
    if (!imageUrl) {
      throw new Error('Image source URL not found in Pexels response.');
    }

    return imageUrl;

  } catch (error) {
    console.error('Error fetching image from Pexels:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`Could not retrieve image: ${errorMessage}`);
  }
}

