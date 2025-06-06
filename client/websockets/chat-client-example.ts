// Example usage of the updated ChatClient with JWT authentication
import { ChatClient } from './chat-client';

// Example of how to use the ChatClient with JWT authentication
export class ChatClientExample {
  private chatClient: ChatClient | null = null;
  
  async initializeChat(jwtToken: string) {
    // Create chat client with JWT token for authentication
    this.chatClient = new ChatClient('http://localhost:3001', jwtToken);
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    if (!this.chatClient) return;
    
    // Handle successful authentication and channel list
    this.chatClient.onIdentified((response) => {
      console.log(`Authenticated as: ${response.username}`);
      console.log('Available channels:', response.channels);
      
      // Auto-join the first available channel if any
      if (response.channels.length > 0) {
        this.chatClient?.joinChannel(response.channels[0].id);
      }
    });
    
    // Handle new messages
    this.chatClient.onMessage((message) => {
      console.log(`[${message.channel}] ${message.sender}: ${message.content}`);
      // Update UI with new message
      this.displayMessage(message);
    });
    
    // Handle channel messages (when joining a channel)
    this.chatClient.onChannelMessages((data) => {
      console.log(`Received ${data.messages.length} messages for channel ${data.channel}`);
      data.messages.forEach(msg => this.displayMessage(msg));
    });
    
    // Handle user joining/leaving
    this.chatClient.onUserJoined((event) => {
      console.log(`${event.username} joined ${event.channel}`);
    });
    
    this.chatClient.onUserLeft((event) => {
      console.log(`${event.username} left ${event.channel}`);
    });
    
    // Handle new channel creation
    this.chatClient.onChannelCreated((channel) => {
      console.log(`New channel created: ${channel.name} (${channel.type})`);
    });
    
    // Handle errors
    this.chatClient.onError((error) => {
      console.error('Chat error:', error);
      // Handle authentication errors, connection failures, etc.
    });
  }
  
  private displayMessage(message: any) {
    // Implement your UI message display logic here
    // For example, append to a chat container, update state, etc.
    console.log(`Message: ${message.content}`);
  }
  
  // Example methods for common chat operations
  sendMessage(content: string) {
    this.chatClient?.sendMessage(content);
  }
  
  joinChannel(channelId: string) {
    this.chatClient?.joinChannel(channelId);
  }
  
  createPublicChannel(name: string) {
    this.chatClient?.createChannel(name, 'public');
  }
  
  createPrivateChannel(name: string) {
    this.chatClient?.createChannel(name, 'private');
  }
  
  disconnect() {
    this.chatClient?.disconnect();
  }
}

// Usage example:
// const chatExample = new ChatClientExample();
// const jwtToken = 'your-jwt-token-here'; // Get this from your auth system
// chatExample.initializeChat(jwtToken);
