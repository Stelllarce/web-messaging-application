import { io, Socket } from 'socket.io-client';
import { ChatMessage, ChannelEvent, SocketUser } from '../../server/src/interfaces/types';

// Define interfaces for client-side types
interface ChannelInfo {
  id: string;
  name: string;
  type: 'public' | 'private';
}

interface IdentifiedResponse {
  userId: string;
  username: string;
  channels: ChannelInfo[];
}

export class ChatClient {
  private socket: Socket;
  private currentChannel: string = '';
  private username: string = '';
  private userId: string = '';
  private channels: ChannelInfo[] = [];
  
  // Event callbacks
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private userJoinedCallbacks: ((event: ChannelEvent) => void)[] = [];
  private userLeftCallbacks: ((event: ChannelEvent) => void)[] = [];
  private channelListCallbacks: ((channels: ChannelInfo[]) => void)[] = [];
  private channelCreatedCallbacks: ((channel: ChannelInfo) => void)[] = [];
  private channelAddedCallbacks: ((channel: ChannelInfo) => void)[] = [];
  private identifiedCallbacks: ((response: IdentifiedResponse) => void)[] = [];
  private channelMessagesCallbacks: ((data: { channel: string; messages: ChatMessage[] }) => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];
  

  constructor(url?: string, token?: string) {
    // Initialize socket with authentication token
    this.socket = io(url ?? 'http://localhost:3001', {
      auth: {
        token: token
      }
    });
    this.setupListeners();
  }
  
  private setupListeners(): void {
    // Handle new messages
    this.socket.on('newMessage', (message: ChatMessage) => {
      // Convert the timestamp string to a Date object if needed
      if (typeof message.timestamp === 'string') {
        message.timestamp = new Date(message.timestamp);
      }
      
      this.messageCallbacks.forEach(callback => callback(message));
    });
    
    // Handle user joining a channel
    this.socket.on('userJoined', (event: ChannelEvent) => {
      this.userJoinedCallbacks.forEach(callback => callback(event));
    });
    
    // Handle user leaving a channel
    this.socket.on('userLeft', (event: ChannelEvent) => {
      this.userLeftCallbacks.forEach(callback => callback(event));
    });
    
    // Handle identification response
    this.socket.on('identified', (response: IdentifiedResponse) => {
      this.username = response.username;
      this.userId = response.userId;
      this.channels = response.channels;
      this.identifiedCallbacks.forEach(callback => callback(response));
    });
    
    // Handle channel messages (when joining a channel)
    this.socket.on('channelMessages', (data: { channel: string; messages: ChatMessage[] }) => {
      this.channelMessagesCallbacks.forEach(callback => callback(data));
    });
    
    // Handle new channel creation
    this.socket.on('channelCreated', (channel: ChannelInfo) => {
      const existingChannel = this.channels.find(c => c.id === channel.id);
      if (!existingChannel) {
        this.channels.push(channel);
      }
      this.channelCreatedCallbacks.forEach(callback => callback(channel));
    });
    
    // Handle being added to a channel
    this.socket.on('channelAdded', (channel: ChannelInfo) => {
      const existingChannel = this.channels.find(c => c.id === channel.id);
      if (!existingChannel) {
        this.channels.push(channel);
      }
      this.channelAddedCallbacks.forEach(callback => callback(channel));
    });
    
    this.socket.on('error', (error: string) => {
      this.errorCallbacks.forEach(callback => callback(error));
    });
    
    this.socket.on('connect_error', (error: Error) => {
      this.errorCallbacks.forEach(callback => callback(error.message));
    });
  }
  
  // Remove the old identify method - authentication now happens via token in constructor
  
  joinChannel(channelId: string): void {
    this.socket.emit('joinChannel', channelId);
    this.currentChannel = channelId;
  }
  
  leaveChannel(channelId: string): void {
    this.socket.emit('leaveChannel', channelId);
    if (this.currentChannel === channelId) {
      this.currentChannel = '';
    }
  }
  
  sendMessage(content: string): void {
    if (!this.currentChannel) {
      console.warn('No current channel selected');
      return;
    }
    this.socket.emit('sendMessage', {
      channel: this.currentChannel,
      content
    });
  }
  
  sendMessageToChannel(channelId: string, content: string): void {
    this.socket.emit('sendMessage', {
      channel: channelId,
      content
    });
  }
  
  createChannel(name: string, type: 'public' | 'private' = 'public'): void {
    this.socket.emit('createChannel', { name, type });
  }
  
  setCurrentChannel(channelId: string): void {
    this.currentChannel = channelId;
  }
  
  getCurrentChannel(): string {
    return this.currentChannel;
  }
  
  getChannels(): ChannelInfo[] {
    return this.channels;
  }
  
  getUsername(): string {
    return this.username;
  }
  
  getUserId(): string {
    return this.userId;
  }
  
  onMessage(callback: (message: ChatMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  onUserJoined(callback: (event: ChannelEvent) => void): void {
    this.userJoinedCallbacks.push(callback);
  }

  onUserLeft(callback: (event: ChannelEvent) => void): void {
    this.userLeftCallbacks.push(callback);
  }

  onChannelList(callback: (channels: ChannelInfo[]) => void): void {
    this.channelListCallbacks.push(callback);
  }

  onChannelCreated(callback: (channel: ChannelInfo) => void): void {
    this.channelCreatedCallbacks.push(callback);
  }

  onChannelAdded(callback: (channel: ChannelInfo) => void): void {
    this.channelAddedCallbacks.push(callback);
  }

  onIdentified(callback: (response: IdentifiedResponse) => void): void {
    this.identifiedCallbacks.push(callback);
  }
  
  onChannelMessages(callback: (data: { channel: string; messages: ChatMessage[] }) => void): void {
    this.channelMessagesCallbacks.push(callback);
  }
  
  onError(callback: (error: string) => void): void {
    this.errorCallbacks.push(callback);
  }
  
  disconnect(): void {
    this.socket.disconnect();
  }
}