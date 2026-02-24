import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket} from 'socket.io';
import { ChatService } from "../service/chat.service";

// it creates a socket server that and open websocket connection 
@WebSocketGateway({
    cors: {
        origin: 'http://localhost:5173', // frontend url
    }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    // here we are using socket.io server instance to emit events to clients
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService){}
    // this methods is called when a client connects and handle the conncetion 
    async handleConnection(client: Socket) {
        const userId = client.handshake.query.userId as string;

        if(!userId) {
            client.disconnect();
            return;
        }

        const previousChat = this.chatService.getPreviousChat(userId);
        client.emit('previousChat', previousChat);
        console.log(`User ${userId} connected`);
    }
    //user sends message to bot
    @SubscribeMessage('sendMessage')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() message: string
    ) {
        const userId = client.handshake.query.userId as string;
        
        if(!userId) {
            client.emit('error', 'User id is required');
            return;
        }
        // message should not be empty
        if(!message || message.trim() === '') {
            client.emit('error', 'Message cannot be empty');
            return;
        }
        try {
            const botResponse = await this.chatService.userMessage(userId, message);
            client.emit('botResponse', botResponse);
        } catch(error: any) {
            console.error('Error in handleMessage:', error.message);
            client.emit('error', error.message || 'Failed to process your message');
        }
    }

    async handleDisconnect(client: Socket) {
        const userId = client.handshake.query.userId as string;
        console.log(`User ${userId} disconnected`);
    }
}
