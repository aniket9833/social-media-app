import express from 'express';
import { check } from 'express-validator';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  getUserChatsController,
  getChatByIdController,
  getChatWithUserController,
  sendMessageController
} from '../controllers/chatController.js';

const router = express.Router();

// Get all chats for a user
router.get('/', protect, getUserChatsController);

// Get a specific chat
router.get('/:chatId', protect, getChatByIdController);

// Get or create chat with a user
router.post('/user/:userId', protect, getChatWithUserController);

// Send a message in a chat
router.post(
  '/:chatId/messages',
  protect,
  upload.single('media'),
  [
    check('text', 'Text is required if no media is provided')
      .if((value, { req }) => !req.file)
      .not()
      .isEmpty()
  ],
  sendMessageController
);

export default router; 