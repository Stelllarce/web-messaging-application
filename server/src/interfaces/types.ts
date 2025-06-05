// shared/types.ts - Common types for both client and server
import { Socket } from 'socket.io';
import { IUserTokenPayload } from '../models/User';

// Derived types from models
export type SocketUser = IUserTokenPayload & {
  channels: string[];
};

// Simplified message format for client-server communication
export interface ChatMessage {
  channel: string;
  sender: string;
  content: string;
  timestamp: Date;
}

// Simple event format for channel events
export interface ChannelEvent {
  channel: string;
  username: string;
}

// Socket.io specific extension
export interface AuthenticatedSocket extends Socket {
  user?: SocketUser;
}

// Re-export IUserTokenPayload for external use
export { IUserTokenPayload } from '../models/User';