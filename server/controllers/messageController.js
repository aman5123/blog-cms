import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { isInMemoryFallback } from '../config/db.js';

export const mockMessages = [
  {
    _id: 'msg1',
    id: 'msg1',
    senderName: 'Aman',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    subject: 'Welcome to CMS Blog Platform!',
    content: 'Hi! Welcome to our publishing platform. Feel free to customize your profile, follow authors, and start sharing your articles.',
    read: false,
    createdAt: new Date(),
  },
];

// @desc Get inbox messages for current user
// @route GET /api/messages
export const getMessages = async (req, res) => {
  try {
    if (isInMemoryFallback) return res.json(mockMessages);

    const messages = await Message.find({
      $or: [{ recipient: req.user._id }, { isBroadcast: true }],
    }).sort({ createdAt: -1 });

    if (messages.length === 0) return res.json(mockMessages);
    res.json(messages);
  } catch (error) {
    res.json(mockMessages);
  }
};

// @desc Send direct message or broadcast to followers
// @route POST /api/messages
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, subject, content, isBroadcast } = req.body;

    if (isInMemoryFallback) {
      const newMsg = {
        _id: 'msg_' + Date.now(),
        id: 'msg_' + Date.now(),
        senderName: req.user.name || 'Author',
        senderAvatar: req.user.avatar,
        subject,
        content,
        read: false,
        isBroadcast: !!isBroadcast,
        createdAt: new Date(),
      };
      mockMessages.unshift(newMsg);
      return res.status(201).json(newMsg);
    }

    const message = await Message.create({
      sender: req.user._id,
      senderName: req.user.name,
      senderAvatar: req.user.avatar,
      recipient: recipientId || null,
      isBroadcast: !!isBroadcast,
      subject,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
