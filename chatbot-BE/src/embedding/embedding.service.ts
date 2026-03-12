import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmbeddingService {
  private apiKey = process.env.GEMINI_API_KEY;

  private embeddingUrl =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent';

  async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(
        `${this.embeddingUrl}?key=${this.apiKey}`,
        {
          content: {
            parts: [{ text }],
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.embedding.values;
    } catch (error) {
      console.error('Error creating embedding:', error.response?.data || error);
      throw new Error('Failed to create embedding');
    }
  }
}