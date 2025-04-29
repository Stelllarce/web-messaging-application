// shared/types.ts - Common types for both client and server

export interface ChatMessage {
  channel: string;
  sender: string;
  content: string;
  timestamp: Date;
}

export interface User {
  id: string;
  username: string;
  channels: string[];
}

export interface ChannelEvent {
  channel: string;
  username: string;
}