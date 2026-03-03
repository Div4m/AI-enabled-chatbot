import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { chatMessage } from '../../src/types/message.type';
import { format } from 'path';

@Injectable()
export class ChatService {
    private systemPrompt = `You are an AI assistant for Infowind Technologies, a professional IT services and software development company.

Infowind Technologies specializes in:
- Custom Web Development including responsive, e-commerce and web applications.
- Mobile App Development across platforms including Android, iOS, React Native and Flutter.
- UI/UX Design, Digital Marketing, and Data Engineering.
- IT Staff Augmentation and dedicated development teams.
- Full-stack services using technologies such as MERN, Laravel, Node.js, Angular, .NET, Python and others.

Infowind offers flexible engagement models:
- Fixed cost projects
- Time & Material
- Dedicated developers (full-time, part-time, hourly)
- Competitive developer rates starting around $15–$20 per hour.

Typical project duration and pricing depend on project complexity. Custom websites and mobile apps often range around $3,500 and can take ~3–6 months.

Contact details:
- Email: sales@infowindtech.com
- Phone (India): +91-8982342713 / +91-731-4108634
- Phone (USA): +1-609-619-5415
- Offices in Indore, India and Dubai, UAE.

IF A QUESTION IS ASKED:

You must *only answer based on Infowind Technologies’ services, pricing, contact info, engagement models, industries served and development solutions*.

IF A QUESTION IS NOT RELATED TO INFOWIND TECHNOLOGIES’ BUSINESS, SERVICES, PRICING OR CONTACT INFORMATION, respond politely with:

“I am here to assist only with questions related to Infowind Technologies’ services and offerings. Please ask something about our development services, pricing, delivery models, or contact info.”

Do not answer general programming questions, comparisons between unrelated technologies, or any unrelated trivia. Always steer the conversation back to Infowind Technologies and its services.`;

    private chat = new Map<string, chatMessage[]>();
    private geminiApiKey = process.env.GEMINI_API_KEY;
    private geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    
    private isCompanyRelated(message: string): boolean{
        const keywords = [
            'hello',
            'hi',
            'infowind',
            'services',
            'pricing',
            'contact',
            'cost',
            'staff',
            'augmentation',
            'hire',
            'developers',
            'office',
            'projects',
            'web',
            'mobile',
            'app',
            'development',
            'company',
            'technologis',
        ];
        return keywords.some(word => message.toLowerCase().includes(word));
    };
    
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

            if (!this.isCompanyRelated(message)) {
                const restictedReply: chatMessage = {
                    sender: 'bot',
                    message: 'I am here to assist only with questions related to Infowind Technologies services and offerings. Please ask something about our development services, pricing, delivery models, or contact info.',
                    userId
                }
                this.chat.get(userId)?.push(restictedReply);
                return restictedReply;
            }
            // method to format the message using the previous chat history , so that gemini give response in the context of the previous conversation 
            const formattedMessage = this.getPreviousChat(userId).slice(-5).map(msg=>({
                role:"user",
                parts:[{text: `${msg.sender}: ${msg.message}`}]
            }))
            // Call Gemini API
            const response = await axios.post(
                `${this.geminiApiUrl}?key=${this.geminiApiKey}`,
                {
                    contents: [
                        
                            {
                            role:'user',
                            parts:[{text: this.systemPrompt}]
                            },
                            ...formattedMessage,
                            {
                            role:'user',
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
            // extract the bot response from the gemini api 
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
            throw new Error('you hit the daily limit!');
        }
    }

    getPreviousChat(userId: string): chatMessage[] {
        return this.chat.get(userId) || [];
    }
}