import mongoose, { Schema } from 'mongoose';

const channelSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['public', 'private'], required: true },
  users: [{ type: String, required: true }],
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  chatType: {
    type: String,
    enum: ['group', 'people'],
    required: function (this: any) {
      return this.type === 'private';
    },
  },
  created_at: { type: Date, default: Date.now },
});

export const Channel = mongoose.model('Channel', channelSchema);
