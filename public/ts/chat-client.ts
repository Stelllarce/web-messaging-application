import { io, Socket } from 'socket.io-client';
import { ChatMessage, User, ChannelEvent} from '../../shared/types';

export class ChatClient {
  private socket: Socket;
  private currentChannel: string = 'general';
  private username: string = '';
  private channels: string[] = [];
  
  // Event callbacks
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private userJoinedCallbacks: ((event: ChannelEvent) => void)[] = [];
  private userLeftCallbacks: ((event: ChannelEvent) => void)[] = [];
  private channelListCallbacks: ((channels: string[]) => void)[] = [];
  private channelCreatedCallbacks: ((channel: string) => void)[] = [];
  private identifiedCallbacks: ((response: User) => void)[] = [];
  

  constructor(url?: string) {
    this.socket = io(url || window.location.origin);
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
    this.socket.on('identified', (response: User) => {
      this.username = response.username;
      this.channels = response.channels;
      this.identifiedCallbacks.forEach(callback => callback(response));
    });
    
    // Handle channel list update
    this.socket.on('channelList', (channels: string[]) => {
      this.channels = channels;
      this.channelListCallbacks.forEach(callback => callback(channels));
    });
    
    // Handle new channel creation
    this.socket.on('channelCreated', (channel: string) => {
      if (!this.channels.includes(channel)) {
        this.channels.push(channel);
      }
      this.channelCreatedCallbacks.forEach(callback => callback(channel));
    });
  }
  
  identify(username: string): void {
    this.socket.emit('identify', username);
  }

  joinChannel(channel: string): void {
    this.socket.emit('joinChannel', channel);
    this.currentChannel = channel;
  }
  
  leaveChannel(channel: string): void {
    this.socket.emit('leaveChannel', channel);
    if (this.currentChannel === channel) {
      this.currentChannel = 'general';
    }
  }
  
  sendMessage(content: string): void {
    this.socket.emit('sendMessage', {
      channel: this.currentChannel,
      content
    });
  }
  
  sendMessageToChannel(channel: string, content: string): void {
    this.socket.emit('sendMessage', {
      channel,
      content
    });
  }
  
  createChannel(channel: string): void {
    this.socket.emit('createChannel', channel);
  }
  
  setCurrentChannel(channel: string): void {
    this.currentChannel = channel;
  }
  
  getCurrentChannel(): string {
    return this.currentChannel;
  }
  
  getChannels(): string[] {
    return this.channels;
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

  onChannelList(callback: (channels: string[]) => void): void {
    this.channelListCallbacks.push(callback);
  }

  onChannelCreated(callback: (channel: string) => void): void {
    this.channelCreatedCallbacks.push(callback);
  }

  onIdentified(callback: (response: User) => void): void {
    this.identifiedCallbacks.push(callback);
  }
  
  disconnect(): void {
    this.socket.disconnect();
  }
}