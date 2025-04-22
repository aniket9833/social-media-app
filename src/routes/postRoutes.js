import express from 'express';
import { check } from 'express-validator';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
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
} from '../controllers/postController.js';

const router = express.Router();

// Create post - can upload multiple files (image, video, audio)
router.post(
  '/',
  protect,
  upload.array('media', 5), // Max 5 files
  [check('text', 'Text is required').notEmpty()],
  createPost
);

// Get feed posts (from people user follows)
router.get('/feed', protect, getFeedPosts);

// Get explore posts (all posts for discovery)
router.get('/explore', protect, getExplorePosts);

// Get bookmarked posts
router.get('/bookmarks', protect, getBookmarkedPosts);

// Get post by id
router.get('/:id', protect, getPostById);

// Update post
router.put(
  '/:id',
  protect,
  upload.array('media', 5),
  [check('text', 'Text is required').notEmpty()],
  updatePost
);

// Delete post
router.delete('/:id', protect, deletePost);

// Like a post
router.put('/:id/like', protect, likePost);

// Unlike a post
router.put('/:id/unlike', protect, unlikePost);

// Bookmark a post
router.put('/:id/bookmark', protect, bookmarkPost);

// Remove bookmark
router.put('/:id/unbookmark', protect, unbookmarkPost);

export default router;
