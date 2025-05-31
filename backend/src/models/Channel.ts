import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IMessage } from './Message';

export interface IChannel extends Document {
  name: string;
  type: 'public' | 'private';
  members?: mongoose.Types.ObjectId[]; 
  messages: mongoose.Types.ObjectId[];
}

const channelSchema = new Schema<IChannel>({
  name: { type: String, required: true },
  type: { type: String, enum: ['public', 'private'], required: true },

  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
});

export const Channel = mongoose.model<IChannel>('Channel', channelSchema);
