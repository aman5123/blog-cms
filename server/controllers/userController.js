import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import { isInMemoryFallback } from '../config/db.js';
import { mockUsers } from '../config/mockStore.js';

// @desc Get all users (Admin only)
// @route GET /api/users
export const getUsers = async (req, res) => {
  try {
    if (isInMemoryFallback) return res.json(mockUsers);

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    if (users.length === 0) return res.json(mockUsers);

    const formatted = users.map(u => ({
      id: u._id,
      _id: u._id,
      username: u.username,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      bio: u.bio,
      createdAt: u.createdAt,
    }));
    res.json(formatted);
  } catch (error) {
    res.json(mockUsers);
  }
};

// @desc Update user role (Admin only)
// @route PUT /api/users/:id/role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (isInMemoryFallback) {
      const u = mockUsers.find((user) => user.id === req.params.id || user._id === req.params.id);
      if (u) {
        u.role = role;
        return res.json({ id: u._id, username: u.username, role: u.role });
      }
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ id: user._id, username: user.username, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete user (Admin only)
// @route DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    if (isInMemoryFallback) {
      const idx = mockUsers.findIndex((u) => u.id === req.params.id || u._id === req.params.id);
      if (idx !== -1) mockUsers.splice(idx, 1);
      return res.json({ message: 'User deleted' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Follow / Unfollow User
// @route POST /api/users/:id/follow
export const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id || req.user.id;

    if (isInMemoryFallback) {
      const currentUser = mockUsers.find((u) => u.id === currentUserId || u._id === currentUserId) || mockUsers[0];
      if (!currentUser.following) currentUser.following = [];
      const idx = currentUser.following.indexOf(targetUserId);
      let isFollowing = false;
      if (idx > -1) {
        currentUser.following.splice(idx, 1);
      } else {
        currentUser.following.push(targetUserId);
        isFollowing = true;
      }
      return res.json({ isFollowing, followingCount: currentUser.following.length });
    }

    const userToFollow = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!currentUser.following) currentUser.following = [];
    if (!userToFollow.followers) userToFollow.followers = [];

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter((id) => id.toString() !== targetUserId.toString());
      userToFollow.followers = userToFollow.followers.filter((id) => id.toString() !== currentUserId.toString());
    } else {
      currentUser.following.push(targetUserId);
      userToFollow.followers.push(currentUserId);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ isFollowing: !isFollowing, followingCount: currentUser.following.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Toggle Bookmark for current user
// @route POST /api/users/bookmarks/:postId
export const toggleBookmark = async (req, res) => {
  try {
    const { postId } = req.params;
    if (isInMemoryFallback) {
      const user = mockUsers.find((u) => u.id === (req.user._id || req.user.id)) || mockUsers[0];
      const idx = user.bookmarks.indexOf(postId);
      let isBookmarked = false;
      if (idx > -1) {
        user.bookmarks.splice(idx, 1);
      } else {
        user.bookmarks.push(postId);
        isBookmarked = true;
      }
      return res.json({ isBookmarked, bookmarks: user.bookmarks });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const bookmarkIndex = user.bookmarks.indexOf(postId);
    let isBookmarked = false;

    if (bookmarkIndex > -1) {
      user.bookmarks.splice(bookmarkIndex, 1);
    } else {
      user.bookmarks.push(postId);
      isBookmarked = true;
    }

    await user.save();
    res.json({ isBookmarked, bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update current user's profile
// @route PUT /api/users/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, username, email, bio, avatar, website } = req.body;
    if (isInMemoryFallback) {
      const user = mockUsers.find((u) => u.id === (req.user._id || req.user.id)) || mockUsers[0];
      if (name) user.name = name;
      if (username) user.username = username;
      if (email) user.email = email;
      if (bio !== undefined) user.bio = bio;
      if (avatar !== undefined) user.avatar = avatar;
      if (website !== undefined) user.website = website;
      return res.json(user);
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }
    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) return res.status(400).json({ message: 'Username already taken' });
      user.username = username;
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (website !== undefined) user.website = website;

    await user.save();

    res.json({
      id: user._id,
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      website: user.website,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Change current user's password
// @route PUT /api/users/password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    if (isInMemoryFallback) {
      return res.json({ message: 'Password changed successfully' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
