import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  _id: Types.ObjectId;
  content: string;
  from: Types.ObjectId;
  channel: Types.ObjectId;
  timestamp: Date;
}

const messageSchema = new Schema<IMessage>({
  content: {
    type: String,
    required: true
  },
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channel: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export const Message = model<IMessage>('Message', messageSchema);
