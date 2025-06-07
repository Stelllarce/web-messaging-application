import { Server } from 'socket.io';

let io: Server | null = null;
const userSocketMap = new Map<string, string>();

export const setSocketIO = (socketIOInstance: Server) => {
  io = socketIOInstance;
};

export const getSocketIO = (): Server | null => {
  return io;
};

export const addUserSocket = (userId: string, socketId: string) => {
  userSocketMap.set(userId, socketId);
};

export const removeUserSocket = (userId: string) => {
  userSocketMap.delete(userId);
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (!io) {
    console.error('Socket.IO instance not initialized');
    return;
  }
  
  const socketId = userSocketMap.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  } else {
    console.warn(`Socket not found for user ${userId}`);
  }
};

export const emitToChannel = (channelId: string, event: string, data: any) => {
  if (!io) {
    console.error('Socket.IO instance not initialized');
    return;
  }
  
  io.to(channelId).emit(event, data);
};
