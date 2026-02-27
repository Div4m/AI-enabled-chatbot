export interface chatMessage {
    message: string,
    userId: string,
    sender: 'user' | 'bot'
}
