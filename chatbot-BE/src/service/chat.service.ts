import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { chatMessage } from '../../src/types/message.type';

@Injectable()
export class ChatService {
    private chat = new Map<string, chatMessage[]>();
    private geminiApiKey = process.env.GEMINI_API_KEY;
    private geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    
    async userMessage(userId: string, message: string): Promise<chatMessage> {
        if(!this.chat.has(userId)) {
            this.chat.set(userId, []);
        }
        
        try {
            // Validate API key
            if (!this.geminiApiKey) {
                throw new Error('Gemini API key is not configured');
            }

            // Store user message
            const userChat: chatMessage = {sender: 'user', message, userId};
            this.chat.get(userId)?.push(userChat);

            // Call Gemini API
            const response = await axios.post(
                `${this.geminiApiUrl}?key=${this.geminiApiKey}`,
                {
                    contents: [
                        {
                            parts: [{
                                text: message
                            }]
                        }
                    ] 
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!reply) {
                throw new Error('Invalid response from Gemini API');
            }

            // Store bot message
            const botChat: chatMessage = {sender: 'bot', message: reply, userId};
            this.chat.get(userId)?.push(botChat);
            
            return botChat;
        } catch (error: any) {
            console.error('Gemini API Full Error:', error.response?.data || error.message);
            throw new Error('Failed to get response from your AI agent');
        }
    }

    getPreviousChat(userId: string): chatMessage[] {
        return this.chat.get(userId) || [];
    }
}