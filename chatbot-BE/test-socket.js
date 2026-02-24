const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
    query: { userId: 'testUser123' }
});

socket.on('connect', () => {
    console.log('✅ Connected to server');
    console.log('\nSending test message...');
    socket.emit('sendMessage', 'Hello! What is Reactjs and explain its hooks that can be useful in chatbot frontend develoment');
});

socket.on('previousChat', (messages) => {
    console.log('\n📬 Previous chat history:');
    console.log(JSON.stringify(messages, null, 2));
});

socket.on('botResponse', (message) => {
    console.log('\n🤖 Bot response:');
    console.log(JSON.stringify(message, null, 2));
    setTimeout(() => socket.disconnect(), 2000);
});

socket.on('error', (error) => {
    console.error('\n❌ Error:', error);
    socket.disconnect();
});

socket.on('disconnect', () => {
    console.log('\n🔌 Disconnected');
    process.exit(0);
});

setTimeout(() => {
    console.log('\n⏱️ Timeout - No response from server');
    socket.disconnect();
    process.exit(1);
}, 3000);
