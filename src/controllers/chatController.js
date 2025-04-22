import { validationResult } from 'express-validator';
import { getUserChats, getChatById, getChatWithUser, sendMessage } from '../services/chatService.js';

// @desc    Get user's chats
// @route   GET /api/chat
// @access  Private
const getUserChatsController = async (req, res) => {
  try {
    const result = await getUserChats(req.user._id);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single chat
// @route   GET /api/chat/:chatId
// @access  Private
const getChatByIdController = async (req, res) => {
  try {
    const result = await getChatById(req.params.chatId, req.user._id);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.message === 'Chat not found' || error.message === 'Access denied') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Get or create chat with another user
// @route   POST /api/chat/user/:userId
// @access  Private
const getChatWithUserController = async (req, res) => {
  try {
    const result = await getChatWithUser(req.user._id, req.params.userId);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.message === 'User not found' || error.message === 'You need to be friends to start a chat') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Send a message
// @route   POST /api/chat/:chatId/messages
// @access  Private
const sendMessageController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await sendMessage(req.params.chatId, req.user._id, req.body, req.file);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    if (error.message === 'Chat not found' || error.message === 'Access denied') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

export { getUserChatsController, getChatByIdController, getChatWithUserController, sendMessageController };
