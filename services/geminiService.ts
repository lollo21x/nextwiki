/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { LanguageCode, languageNameMap } from '../utils/translations';

// --- OpenRouter Configuration ---
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// --- End OpenRouter Configuration ---

// --- Pexels Configuration for Images ---
const PEXELS_API_KEY = 'P0JY9qNicegGHGtqSUzvvgXuqYKJz5VSfLcjDUeMk0V4BB3S5yVkwGZg';
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';
// --- End Image Configuration ---

/**
 * Streams a definition for a given topic from the OpenRouter API.
 * @param topic The word or term to define.
 * @param language The language for the response.
 * @returns An async generator that yields text chunks of the definition.
 */
export async function* streamDefinition(
  topic: string,
  language: LanguageCode,
): AsyncGenerator<string, void, undefined> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    const errorMsg = 'Error: OPENROUTER_API_KEY is not configured. Please set it as an environment variable in your deployment settings.';
    console.error(errorMsg);
    yield errorMsg;
    return;
  }
  
  const fullLanguageName = languageNameMap[language] || 'English';
  const prompt = `Provide a concise, single-paragraph encyclopedia-style definition for the term: "${topic}". The response must be in ${fullLanguageName}. Be informative and neutral. Do not use markdown, titles, or any special formatting. Respond with only the text of the definition itself.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
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
 * Fetches an image for a given topic from the Pexels API.
 * @param topic The topic to search for an image.
 * @returns A promise that resolves to a URL of the image.
 */
export async function generateImage(topic: string): Promise<string> {
  const url = `${PEXELS_API_URL}?query=${encodeURIComponent(topic)}&per_page=1&orientation=landscape`;
  
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
      console.warn(`No image found on Pexels for "${topic}".`);
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