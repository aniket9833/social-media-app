import express from 'express';
import { check } from 'express-validator';
import { protect } from '../middleware/auth.js';
import {
  createCommentController,
  deleteCommentController,
  getPostCommentsController
} from '../controllers/commentController.js';

const router = express.Router();

// Get comments for a post
router.get('/:postId', protect, getPostCommentsController);

// Create a comment
router.post(
  '/:postId',
  protect,
  [check('text', 'Text is required').not().isEmpty()],
  createCommentController
);

// Delete a comment
router.delete('/:commentId', protect, deleteCommentController);

export default router; 