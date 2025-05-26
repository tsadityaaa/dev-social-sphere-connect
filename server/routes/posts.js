
const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new post
router.post('/', auth, [
  body('text').trim().isLength({ min: 1, max: 280 }).withMessage('Post text must be between 1 and 280 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { text } = req.body;
    
    const post = new Post({
      text,
      userId: req.user._id
    });

    await post.save();
    await post.populate('userId', 'name email');

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts (updated to show all posts with user info)
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching all posts...');
    const posts = await Post.find()
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(100);

    console.log('Found posts:', posts.length);
    res.json(posts);
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get timeline posts (posts from followed users + own posts)
router.get('/timeline', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const followingIds = [...currentUser.following, req.user._id];

    const posts = await Post.find({ userId: { $in: followingIds } })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(posts);
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get posts by specific user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const posts = await Post.find({ userId })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
