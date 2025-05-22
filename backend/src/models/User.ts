import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isMe: { type: Boolean, default: false }, //??????????????????????????
});

export const User = mongoose.model('User', userSchema);
