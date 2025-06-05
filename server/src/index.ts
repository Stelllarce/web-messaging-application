import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import { verify } from 'jsonwebtoken';
import { seedData } from './utils/database';
import { connect as connectAPI } from "./controllers/index";
import { User, IUser, IUserTokenPayload } from './models/User';
import { Channel, IChannel } from './models/Channel';
import { Message, IMessage } from './models/Message';
import { ChatMessage, ChannelEvent, SocketUser } from './interfaces/types';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Connect API routes
connectAPI(app);

// MongoDB connection
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('MONGO_URI is not set in the .env file!');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('Connected with MongoDB'))
  .catch((err) => {
    console.error('Error while connecting MongoDB:', err);
    process.exit(1);
  });

mongoose.connection.once('open', async () => {
  try {
    await seedData(true);
  } catch (err) {
    console.error('Error during seedData:', err);
  }
});

// Socket authentication middleware
const authenticateSocket = async (socket: Socket, next: Function) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('No token provided'));
    }

    const decoded = verify(token, process.env.ACCESS_TOKEN as string) as IUserTokenPayload;
    const user = await User.findById(decoded._id);
    
    if (!user) {
      return next(new Error('User not found'));
    }

    (socket as any).user = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      channels: []
    };
    
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};

io.use(authenticateSocket);

io.on('connection', async (socket: Socket) => {
  const socketUser = (socket as any).user as SocketUser;
  console.log(`New connection: ${socket.id} - ${socketUser?.username}`);
  
  if (!socketUser) {
    socket.disconnect();
    return;
  }

  // Get user's channels and join socket rooms
  try {
    const publicChannels = await Channel.find({ type: 'public' });
    const privateChannels = await Channel.find({ 
      type: 'private', 
      users: socketUser._id 
    });
    
    const allChannels = [...publicChannels, ...privateChannels];
    
    // Join all channels the user has access to
    for (const channel of allChannels) {
      socket.join(channel._id.toString());
      socketUser.channels.push(channel._id.toString());
    }

    // Send user identification confirmation
    socket.emit('identified', { 
      userId: socketUser._id, 
      username: socketUser.username,
      channels: allChannels.map(ch => ({
        id: ch._id.toString(),
        name: ch.name,
        type: ch.type
      }))
    });

    // Notify others in channels that user is online
    for (const channel of allChannels) {
      socket.to(channel._id.toString()).emit('userJoined', {
        channel: channel._id.toString(),
        username: socketUser.username
      } as ChannelEvent);
    }

  } catch (error) {
    console.error('Error during connection setup:', error);
    socket.disconnect();
    return;
  }

  // Handle joining a channel
  socket.on('joinChannel', async (channelId: string) => {
    if (!socketUser) return;
    
    try {
      const channel = await Channel.findById(channelId);
      if (!channel) {
        socket.emit('error', 'Channel not found');
        return;
      }

      // Check if user can join the channel
      if (channel.type === 'private' && !channel.users?.includes(socketUser._id as any)) {
        socket.emit('error', 'Access denied to private channel');
        return;
      }

      // Add user to channel if not already there
      if (channel.type === 'private' && !channel.users?.includes(socketUser._id as any)) {
        channel.users?.push(socketUser._id as any);
        await channel.save();
      }

      socket.join(channelId);
      
      if (!socketUser.channels.includes(channelId)) {
        socketUser.channels.push(channelId);
      }

      // Notify others in the channel
      socket.to(channelId).emit('userJoined', {
        channel: channelId,
        username: socketUser.username
      } as ChannelEvent);

      // Send recent messages from the channel
      const messages = await Message.find({ channel: channelId })
        .populate('from', 'username')
        .sort({ timestamp: -1 })
        .limit(50);

      socket.emit('channelMessages', {
        channel: channelId,
        messages: messages.reverse().map(msg => ({
          channel: channelId,
          sender: (msg.from as any).username,
          content: msg.content,
          timestamp: msg.timestamp
        }))
      });

    } catch (error) {
      console.error('Error joining channel:', error);
      socket.emit('error', 'Failed to join channel');
    }
  });

  // Handle leaving a channel
  socket.on('leaveChannel', async (channelId: string) => {
    if (!socketUser) return;
    
    try {
      const channel = await Channel.findById(channelId);
      if (!channel) return;

      socket.leave(channelId);
      
      // Remove channel from user's channels
      socketUser.channels = socketUser.channels.filter((c: string) => c !== channelId);
      
      // For private channels, remove user from channel users
      if (channel.type === 'private') {
        channel.users = channel.users?.filter(userId => userId.toString() !== socketUser._id);
        await channel.save();
      }

      // Notify others in the channel
      socket.to(channelId).emit('userLeft', {
        channel: channelId,
        username: socketUser.username
      } as ChannelEvent);

    } catch (error) {
      console.error('Error leaving channel:', error);
    }
  });

  // Handle sending a message
  socket.on('sendMessage', async (data: { channel: string, content: string }) => {
    if (!socketUser) return;
    
    const { channel: channelId, content } = data;
    
    try {
      // Verify user has access to channel
      const channel = await Channel.findById(channelId);
      if (!channel) {
        socket.emit('error', 'Channel not found');
        return;
      }

      if (channel.type === 'private' && !channel.users?.includes(socketUser._id as any)) {
        socket.emit('error', 'Access denied to channel');
        return;
      }

      // Create and save message
      const message = new Message({
        content,
        from: socketUser._id,
        channel: channelId,
        timestamp: new Date()
      });

      await message.save();

      // Add message to channel
      channel.messages.push(message._id);
      await channel.save();

      // Create message object for broadcasting
      const messageForBroadcast: ChatMessage = {
        channel: channelId,
        sender: socketUser.username,
        content,
        timestamp: message.timestamp
      };

      // Broadcast message to all clients in the channel
      io.to(channelId).emit('newMessage', messageForBroadcast);

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  // Handle creating a new channel
  socket.on('createChannel', async (data: { name: string, type: 'public' | 'private' }) => {
    if (!socketUser) return;
    
    const { name, type } = data;
    
    try {
      // Check if channel already exists
      const existingChannel = await Channel.findOne({ name, type });
      if (existingChannel) {
        socket.emit('error', 'Channel already exists');
        return;
      }

      // Create new channel
      const channel = new Channel({
        name,
        type,
        creator: socketUser._id,
        users: type === 'private' ? [socketUser._id] : undefined,
        messages: []
      });

      await channel.save();

      // Join the creator to the channel
      socket.join(channel._id.toString());
      socketUser.channels.push(channel._id.toString());

      // Notify about channel creation
      if (type === 'public') {
        io.emit('channelCreated', {
          id: channel._id.toString(),
          name: channel.name,
          type: channel.type
        });
      } else {
        socket.emit('channelCreated', {
          id: channel._id.toString(),
          name: channel.name,
          type: channel.type
        });
      }

    } catch (error) {
      console.error('Error creating channel:', error);
      socket.emit('error', 'Failed to create channel');
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    if (!socketUser) return;
    
    console.log(`User disconnected: ${socketUser.username}`);
    
    // Notify all channels the user was in
    socketUser.channels.forEach((channelId: string) => {
      socket.to(channelId).emit('userLeft', {
        channel: channelId,
        username: socketUser.username
      } as ChannelEvent);
    });
  });
});

// Additional API endpoints for channels
app.get('/api/channels', async (req, res) => {
  try {
    const channels = await Channel.find({}, 'name type');
    res.json(channels);
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// Start the unified server
server.listen(port, () => {
  console.log(`Server (API + Socket.IO) running on http://localhost:${port}`);
});

export { app, server, io };
