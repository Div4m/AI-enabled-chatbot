import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class EmbeddingService {
    private genAI : GoogleGenerativeAI;

    constructor(){
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_Key || '');
    }
    async createEmbedding(text: string): Promise<number[]>{
        try{
            const model = this.genAI.getGenerativeModel({
                model: 'text-embedding-004',
            })
            const result = await model.embedContent(text);
            const embeddings = result.embedding.values;
            console.log('Generated embedding:', embeddings);
            return embeddings;
        } catch (error) {
            console.error('Error creating embedding:', error);
            throw new Error('Failed to create embedding');
        }
    }
}