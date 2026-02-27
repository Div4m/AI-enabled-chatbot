import { io, Socket } from 'socket.io-client';

// Generate userId if not in localStorage
const generateUserId = () => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = `user_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('userId', userId);
    }
    return userId;
};

export const userId = generateUserId();

export const socket: Socket = io('http://localhost:3000', {
    query: { userId },
});

// Connection events
socket.on('connect', () => {
    console.log('Connected to server with userId:', userId);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});