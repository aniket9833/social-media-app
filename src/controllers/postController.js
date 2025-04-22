import { validationResult } from 'express-validator';
import {
  createPost,
  getFeedPosts,
  getExplorePosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  bookmarkPost,
  unbookmarkPost,
  getBookmarkedPosts,
} from '../services/postService.js';

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPostController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await createPost(req.user._id, req.body, req.files);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all posts (for feed)
// @route   GET /api/posts/feed
// @access  Private
const getFeedPostsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'recent';

    const result = await getFeedPosts(req.user._id, page, limit, sort);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all posts (explore)
// @route   GET /api/posts/explore
// @access  Private
const getExplorePostsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'recent';

    const result = await getExplorePosts(page, limit, sort);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPostByIdController = async (req, res) => {
  try {
    const result = await getPostById(req.params.id);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.message === 'Post not found') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePostController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await updatePost(req.params.id, req.user._id, req.body, req.files);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.message === 'Post not found' || error.message === 'User not authorized') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePostController = async (req, res) => {
  try {
    await deletePost(req.params.id, req.user._id);
    res.json({ message: 'Post removed' });
  } catch (error) {
    console.error(error);
    if (error.message === 'Post not found' || error.message === 'User not authorized') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Like a post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePostController = async (req, res) => {
  try {
    const result = await likePost(req.params.id, req.user._id);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.message === 'Post not found' || error.message === 'Post already liked') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Unlike a post
// @route   PUT /api/posts/:id/unlike
// @access  Private
const unlikePostController = async (req, res) => {
  try {
    const result = await unlikePost(req.params.id, req.user._id);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.message === 'Post not found' || error.message === 'Post not liked') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Bookmark a post
// @route   PUT /api/posts/:id/bookmark
// @access  Private
const bookmarkPostController = async (req, res) => {
  try {
    const result = await bookmarkPost(req.params.id, req.user._id);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.message === 'Post not found' || error.message === 'Post already bookmarked') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Unbookmark a post
// @route   PUT /api/posts/:id/unbookmark
// @access  Private
const unbookmarkPostController = async (req, res) => {
  try {
    const result = await unbookmarkPost(req.params.id, req.user._id);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.message === 'Post not found' || error.message === 'Post not bookmarked') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Get bookmarked posts
// @route   GET /api/posts/bookmarked
// @access  Private
const getBookmarkedPostsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getBookmarkedPosts(req.user._id, page, limit);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export {
  createPostController,
  getFeedPostsController,
  getExplorePostsController,
  getPostByIdController,
  updatePostController,
  deletePostController,
  likePostController,
  unlikePostController,
  bookmarkPostController,
  unbookmarkPostController,
  getBookmarkedPostsController,
};
