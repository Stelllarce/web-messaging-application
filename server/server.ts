import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import { ChatMessage, User, ChannelEvent } from '../shared/types';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// In-memory data store
const users = new Map<string, User>();
const channelMessages = new Map<string, ChatMessage[]>();

// Default channels
const defaultChannels = ['general', 'work', 'slack'];
defaultChannels.forEach(channel => {
  if (!channelMessages.has(channel)) {
    channelMessages.set(channel, []);
  }
});

io.on('connection', (socket: Socket) => {
  console.log(`New connection: ${socket.id}`);
  let currentUser: User;

  // User identification (temporary, should later be replaced with a proper auth system)
  socket.on('identify', (username: string) => {
    currentUser = {
      id: socket.id,
      username,
      channels: ['general'] // Default channel
    };
    users.set(socket.id, currentUser);
    
    // Join default channel
    socket.join('general');
    socket.emit('identified', { userId: socket.id, username, channels: defaultChannels });
    
    // Send list of available channels
    socket.emit('channelList', defaultChannels);
    
    // Notify others in the channel
    socket.to('general').emit('userJoined', {
      channel: 'general',
      username
    } as ChannelEvent);
  });

  // Handle for joining a channel
  socket.on('joinChannel', (channel: string) => {
    if (!currentUser) return;
    
    // Add channel to user's channels if not already there
    if (!currentUser.channels.includes(channel)) {
      currentUser.channels.push(channel);
      users.set(socket.id, currentUser);
    }
    
    socket.join(channel);
    
    // Notify others in the channel
    socket.to(channel).emit('userJoined', {
      channel,
      username: currentUser.username
    } as ChannelEvent);
  });

  // Handle leaving a channel
  socket.on('leaveChannel', (channel: string) => {
    if (!currentUser) return;
    
    socket.leave(channel);
    
    // Remove channel from user's channels
    currentUser.channels = currentUser.channels.filter(c => c !== channel);
    users.set(socket.id, currentUser);
    
    // Notify others in the channel
    socket.to(channel).emit('userLeft', {
      channel,
      username: currentUser.username
    } as ChannelEvent);
  });

  // Handle for a new message
  socket.on('sendMessage', (data: { channel: string, content: string }) => {
    if (!currentUser) return;
    
    const { channel, content } = data;
    
    // Create message object
    const message: ChatMessage = {
      channel,
      sender: currentUser.username,
      content,
      timestamp: new Date()
    };
    
    // Store message in memory (temporarily)
    let channelMsgs = channelMessages.get(channel) || [];
    channelMsgs.push(message);
    channelMessages.set(channel, channelMsgs);
    
    // Broadcast message to all clients in the channel
    io.to(channel).emit('newMessage', message);
  });

  // Handle for creating a new channel
  socket.on('createChannel', (channel: string) => {
    if (!currentUser) return;
    
    if (!channelMessages.has(channel)) {
      channelMessages.set(channel, []);
      io.emit('channelCreated', channel);
    }
  });

  // Handle for user disconnection
  socket.on('disconnect', () => {
    if (!currentUser) return;
    
    console.log(`User disconnected: ${currentUser.username}`);
    
    // Notify all channels the user was in
    currentUser.channels.forEach(channel => {
      socket.to(channel).emit('userLeft', {
        channel,
        username: currentUser.username
      } as ChannelEvent);
    });
    
    users.delete(socket.id);
  });
});

// API endpoints 

app.get('/api/channels', (req, res) => {
  res.json(Array.from(channelMessages.keys()));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, server, io };