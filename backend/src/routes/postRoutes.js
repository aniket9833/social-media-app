import express from 'express';
import { check } from 'express-validator';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
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
} from '../controllers/postController.js';

const router = express.Router();

// Create post - can upload multiple files (image, video, audio)
router.post(
  '/',
  protect,
  upload.array('media', 5), // Max 5 files
  [check('text', 'Text is required').notEmpty()],
  createPostController
);

// Get feed posts (from people user follows)
router.get('/feed', protect, getFeedPostsController);

// Get explore posts (all posts for discovery)
router.get('/explore', protect, getExplorePostsController);

// Get bookmarked posts
router.get('/bookmarks', protect, getBookmarkedPostsController);

// Get post by id
router.get('/:id', protect, getPostByIdController);

// Update post
router.put(
  '/:id',
  protect,
  upload.array('media', 5),
  [check('text', 'Text is required').notEmpty()],
  updatePostController
);

// Delete post
router.delete('/:id', protect, deletePostController);

// Like a post
router.put('/:id/like', protect, likePostController);

// Unlike a post
router.put('/:id/unlike', protect, unlikePostController);

// Bookmark a post
router.put('/:id/bookmark', protect, bookmarkPostController);

// Remove bookmark
router.put('/:id/unbookmark', protect, unbookmarkPostController);

export default router;
