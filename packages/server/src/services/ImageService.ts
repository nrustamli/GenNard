import { GoogleGenAI, Modality } from '@google/genai';

export interface GeneratedImage {
  data: Buffer;
  mimeType: string;
}

export class ImageService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateImage(prompt: string): Promise<GeneratedImage> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error('No content parts in image generation response');
    }

    for (const part of parts) {
      if (part.inlineData?.data) {
        return {
          data: Buffer.from(part.inlineData.data, 'base64'),
          mimeType: part.inlineData.mimeType ?? 'image/png',
        };
      }
    }

    throw new Error('No image data found in Gemini response');
  }
}
