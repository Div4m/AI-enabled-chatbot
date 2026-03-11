import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { chatMessage } from '../../src/types/message.type';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { supabase } from 'src/supabase/supabse.client';

@Injectable()
export class ChatService {

    constructor(
        private readonly embeddingService: EmbeddingService
    ) {}

    // Generic RAG system prompt
    private systemPrompt = `
You are an AI assistant that answers questions using the provided context from a knowledge base.

Rules:
- Only answer using the provided context.
- If the context does not contain the answer, say:
  "I couldn't find the answer in the provided documents."
- Do not invent information.
- Keep answers clear and concise.
`;

    private chat = new Map<string, chatMessage[]>();

    private geminiApiKey = process.env.GEMINI_API_KEY;

    private geminiApiUrl =
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    /*
    -----------------------------------
    VECTOR SEARCH FUNCTION
    -----------------------------------
    */

    async searchSimilarDocuments(question: string) {

        try {

            const embedding = await this.embeddingService.createEmbedding(question);

            const { data, error } = await supabase.rpc('match_documents', {
                query_embedding: embedding,
                match_threshold: 0.7,
                match_count: 5
            });

            if (error) {
                console.error('Supabase search error:', error);
                return [];
            }

            return data;

        } catch (error) {
            console.error('Vector search error:', error);
            return [];
        }
    }

    /*
    -----------------------------------
    CHAT FUNCTION
    -----------------------------------
    */

    async userMessage(userId: string, message: string): Promise<chatMessage> {

        if (!this.chat.has(userId)) {
            this.chat.set(userId, []);
        }

        try {

            if (!this.geminiApiKey) {
                throw new Error('Gemini API key is missing');
            }

            // Store user message
            const userChat: chatMessage = {
                sender: 'user',
                message,
                userId
            };

            this.chat.get(userId)?.push(userChat);

            /*
            -----------------------------------
            STEP 1: SEARCH VECTOR DATABASE
            -----------------------------------
            */

            const docs = await this.searchSimilarDocuments(message);

            const context = docs
                ?.map((doc: any) => doc.chunk_text)
                .join('\n\n');

            /*
            -----------------------------------
            STEP 2: FORMAT CHAT HISTORY
            -----------------------------------
            */

            const formattedHistory = this.getPreviousChat(userId)
                .slice(-5)
                .map(msg => ({
                    role: "user",
                    parts: [{ text: `${msg.sender}: ${msg.message}` }]
                }));


            /*
            -----------------------------------
            STEP 3: CREATE FINAL PROMPT
            -----------------------------------
            */

            const prompt = `
Context:
${context}

Question:
${message}

Answer using only the context above.
`;

            /*
            -----------------------------------
            STEP 4: CALL GEMINI
            -----------------------------------
            */

            const response = await axios.post(
                `${this.geminiApiUrl}?key=${this.geminiApiKey}`,
                {
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: this.systemPrompt }]
                        },
                        ...formattedHistory,
                        {
                            role: 'user',
                            parts: [{ text: prompt }]
                        }
                    ]
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const reply =
                response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!reply) {
                throw new Error('Invalid Gemini response');
            }

            const botChat: chatMessage = {
                sender: 'bot',
                message: reply,
                userId
            };

            this.chat.get(userId)?.push(botChat);

            return botChat;

        } catch (error: any) {

            console.error(
                'Chat error:',
                error.response?.data || error.message
            );

            throw new Error('Failed to generate response');
        }
    }

    getPreviousChat(userId: string): chatMessage[] {
        return this.chat.get(userId) || [];
    }
}