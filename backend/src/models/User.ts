import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  privateChannels: Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  privateChannels: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Channel' 
    }
  ]
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);
