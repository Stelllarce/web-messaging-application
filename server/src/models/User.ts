import { Schema, model, Document, Types } from 'mongoose';
import { Request } from 'express';

export interface IUser extends Document {
  _id: Types.ObjectId; // Mongoose uses ObjectId by default, but we can use string in the token payload
  username: string;
  email: string;
  password: string;
  privateChannels: Types.ObjectId[];
}

export interface IUserTokenPayload {
  _id: string;
  username: string;
  email: string;
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

export interface IAuthenticatedUserRequest extends Request {
    user: IUserTokenPayload;
}