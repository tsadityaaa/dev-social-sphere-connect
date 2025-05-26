
const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all users (excluding current user)
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching users for explore page...');
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('name email bio followers following createdAt')
      .sort({ createdAt: -1 });
    
    console.log('Found users:', users.length);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Name cannot be empty'),
  body('bio').optional().isLength({ max: 200 }).withMessage('Bio cannot be more than 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, bio } = req.body;
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow a user
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    if (req.user.following.includes(userId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add to following list of current user
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: userId }
    });

    // Add to followers list of target user
    await User.findByIdAndUpdate(userId, {
      $addToSet: { followers: currentUserId }
    });

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow a user
router.delete('/:userId/follow', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Remove from following list of current user
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: userId }
    });

    // Remove from followers list of target user
    await User.findByIdAndUpdate(userId, {
      $pull: { followers: currentUserId }
    });

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
