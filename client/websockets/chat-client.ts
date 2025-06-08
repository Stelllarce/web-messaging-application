import { io, Socket } from 'socket.io-client';
import config from '../src/config';
import { ChatMessage, ChannelEvent } from '../../server/src/interfaces/types';

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
  private readonly socket: Socket;
  private currentChannel: string = '';
  private username: string = '';
  private userId: string = '';
  private channels: ChannelInfo[] = [];
  
  // Event callbacks
  private readonly messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private readonly userJoinedCallbacks: ((event: ChannelEvent) => void)[] = [];
  private readonly userLeftCallbacks: ((event: ChannelEvent) => void)[] = [];
  private readonly channelListCallbacks: ((channels: ChannelInfo[]) => void)[] = [];
  private readonly channelCreatedCallbacks: ((channel: ChannelInfo) => void)[] = [];
  private readonly channelAddedCallbacks: ((channel: ChannelInfo) => void)[] = [];
  private readonly channelRemovedCallbacks: ((channel: ChannelInfo) => void)[] = [];
  private readonly channelDeletedCallbacks: ((channel: ChannelInfo) => void)[] = [];
  private readonly identifiedCallbacks: ((response: IdentifiedResponse) => void)[] = [];
  private readonly channelMessagesCallbacks: ((data: { channel: string; messages: ChatMessage[] }) => void)[] = [];
  private readonly errorCallbacks: ((error: string) => void)[] = [];
  private readonly onlineNotificationCallbacks: ((message: { sender: string; content: string; timestamp: Date }) => void)[] = [];
  private readonly offlineNotificationCallbacks: ((message: { sender: string; content: string; timestamp: Date }) => void)[] = [];
  private readonly userKickedCallbacks: ((message: { sender: string; content: string; timestamp: Date; channel: string }) => void)[] = [];
  

  constructor(url?: string, token?: string) {
    // Initialize socket with authentication token
    this.socket = io(url ?? config.WS_URL, {
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
    
    // Handle being removed from a channel
    this.socket.on('channelRemoved', (channel: ChannelInfo) => {
      // Remove the channel from the local channels list
      this.channels = this.channels.filter(c => c.id !== channel.id);
      this.channelRemovedCallbacks.forEach(callback => callback(channel));
    });
    
    // Handle channel deletion
    this.socket.on('channelDeleted', (channel: ChannelInfo) => {
      this.channels = this.channels.filter(c => c.id !== channel.id);
      this.channelDeletedCallbacks.forEach(callback => callback(channel));
    });
    
    // Handle online notifications
    this.socket.on('userOnlineNotification', (message: { sender: string; content: string; timestamp: Date }) => {
      // Convert timestamp string to Date object if needed
      if (typeof message.timestamp === 'string') {
        message.timestamp = new Date(message.timestamp);
      }
      this.onlineNotificationCallbacks.forEach(callback => callback(message));
    });
    
    // Handle offline notifications
    this.socket.on('userOfflineNotification', (message: { sender: string; content: string; timestamp: Date }) => {
      // Convert timestamp string to Date object if needed
      if (typeof message.timestamp === 'string') {
        message.timestamp = new Date(message.timestamp);
      }
      this.offlineNotificationCallbacks.forEach(callback => callback(message));
    });
    
    // Handle user kicked notifications
    this.socket.on('userKicked', (message: { sender: string; content: string; timestamp: Date; channel: string }) => {
      // Convert timestamp string to Date object if needed
      if (typeof message.timestamp === 'string') {
        message.timestamp = new Date(message.timestamp);
      }
      this.userKickedCallbacks.forEach(callback => callback(message));
    });
    
    // Handle public channel events
    this.socket.on('publicChannelAdded', (channel: ChannelInfo) => {
      const existingChannel = this.channels.find(c => c.id === channel.id);
      if (!existingChannel) {
        this.channels.push(channel);
      }
      this.channelAddedCallbacks.forEach(callback => callback(channel));
    });
    
    this.socket.on('publicChannelRemoved', (channel: ChannelInfo) => {
      this.channels = this.channels.filter(c => c.id !== channel.id);
      this.channelRemovedCallbacks.forEach(callback => callback(channel));
    });

    this.socket.on('publicChannelUpdated', (channel: ChannelInfo) => {
      const existingChannelIndex = this.channels.findIndex(c => c.id === channel.id);
      if (existingChannelIndex !== -1) {
        this.channels[existingChannelIndex] = channel;
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

  onChannelRemoved(callback: (channel: ChannelInfo) => void): void {
    this.channelRemovedCallbacks.push(callback);
  }

  onChannelDeleted(callback: (channel: ChannelInfo) => void): void {
    this.channelDeletedCallbacks.push(callback);
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
  
  onOnlineNotification(callback: (message: { sender: string; content: string; timestamp: Date }) => void): void {
    this.onlineNotificationCallbacks.push(callback);
  }
  
  onOfflineNotification(callback: (message: { sender: string; content: string; timestamp: Date }) => void): void {
    this.offlineNotificationCallbacks.push(callback);
  }
  
  onUserKicked(callback: (message: { sender: string; content: string; timestamp: Date; channel: string }) => void): void {
    this.userKickedCallbacks.push(callback);
  }
  
  disconnect(): void {
    this.socket.disconnect();
  }
}