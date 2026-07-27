import { Settings } from '../models/Settings.js';

// @desc Get site settings
// @route GET /api/settings
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({
      siteTitle: settings.siteTitle,
      siteDescription: settings.siteDescription,
      postsPerPage: settings.postsPerPage,
      allowRegistration: settings.allowRegistration,
      allowComments: settings.allowComments,
      requireCommentApproval: settings.requireCommentApproval,
      maintenanceMode: settings.maintenanceMode,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update site settings (Admin only)
// @route PUT /api/settings
export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    const fields = ['siteTitle', 'siteDescription', 'postsPerPage', 'allowRegistration', 'allowComments', 'requireCommentApproval', 'maintenanceMode'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });
    await settings.save();
    res.json({ message: 'Settings saved', ...req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
