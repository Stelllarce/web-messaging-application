import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IMessage } from './Message';

export interface IChannel extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  type: 'public' | 'private';
  creator: mongoose.Types.ObjectId; // Assuming creator is a User ID
  users?: mongoose.Types.ObjectId[]; 
  messages: mongoose.Types.ObjectId[];
}

const channelSchema = new Schema<IChannel>({
  name: { type: String, required: true },
  type: { type: String, enum: ['public', 'private'], required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  users: {
  type: [mongoose.Schema.Types.ObjectId],
  ref: 'User',
  required: function (this: any) {
    return this.type === 'private';
  },
  default: undefined
},

  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
});

export const Channel = mongoose.model<IChannel>('Channel', channelSchema);
