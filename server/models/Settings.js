import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  siteTitle: { type: String, default: 'CMS Blog' },
  siteDescription: { type: String, default: 'A modern blog platform' },
  postsPerPage: { type: Number, default: 6 },
  allowRegistration: { type: Boolean, default: true },
  allowComments: { type: Boolean, default: true },
  requireCommentApproval: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
}, { timestamps: true });

export const Settings = mongoose.model('Settings', settingsSchema);
