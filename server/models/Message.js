import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderName: { type: String, required: true },
  senderAvatar: { type: String },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isBroadcast: { type: Boolean, default: false },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
}, {
  timestamps: true,
});

export const Message = mongoose.model('Message', messageSchema);
