/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// --- OpenRouter Configuration ---
// WARNING: This key is publicly exposed and should only be used for free, rate-limited, non-production accounts.
const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.5-flash-image-preview:free';

// These headers are recommended by OpenRouter for tracking and identification.
const headers = {
  'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://nextwiki.github.io', // Replace with your site URL
  'X-Title': 'NextWiki', // Replace with your app name
};
// --- End Configuration ---


/**
 * Streams a definition for a given topic from the OpenRouter API.
 * @param topic The word or term to define.
 * @returns An async generator that yields text chunks of the definition.
 */
export async function* streamDefinition(
  topic: string,
): AsyncGenerator<string, void, undefined> {
  const prompt = `Provide a concise, single-paragraph encyclopedia-style definition for the term: "${topic}". Be informative and neutral. Do not use markdown, titles, or any special formatting. Respond with only the text of the definition itself.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${await response.text()}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          if (data === '[DONE]') {
            return;
          }
          try {
            const json = JSON.parse(data);
            const content = json.choices[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            console.error('Failed to parse stream chunk:', data);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error streaming from OpenRouter:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    yield `Error: Could not generate content for "${topic}". ${errorMessage}`;
    throw new Error(errorMessage);
  }
}

/**
 * Generates an image for a given topic from the OpenRouter API.
 * This function attempts to use a multimodal model for image generation.
 * @param topic The topic to generate an image for.
 * @returns A promise that resolves to a base64 data URL of the image.
 */
export async function generateImage(topic: string): Promise<string> {
  // A prompt specifically crafted to request a base64 image from a multimodal model.
  const prompt = `Generate a modern, minimalist, abstract visualization representing the concept of "${topic}". Vector art style, clean lines, duotone color palette, on a clean background. IMPORTANT: Respond with ONLY the raw base64 encoded PNG image string and nothing else. Do not include any markdown, explanation, or any other text.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            model: MODEL,
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    let base64ImageBytes = data.choices[0]?.message?.content;

    if (!base64ImageBytes || base64ImageBytes.length < 100) {
      console.error('API did not return valid image data. Response:', base64ImageBytes);
      throw new Error('API returned no valid image data.');
    }

    // Clean up potential markdown or other text artifacts from the response
    base64ImageBytes = base64ImageBytes.replace(/```/g, '').replace(/b64/g, '').trim();

    // Basic validation to see if it looks like a base64 string
    const isBase64 = /^[A-Za-z0-9+/=]+$/.test(base64ImageBytes);
    if (!isBase64) {
      console.error('API response is not a valid base64 string:', base64ImageBytes);
      throw new Error('API response was not in the expected base64 format.');
    }
    
    return `data:image/png;base64,${base64ImageBytes}`;

  } catch (error) {
    console.error('Error generating image from OpenRouter:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`Could not generate image: ${errorMessage}`);
  }
}