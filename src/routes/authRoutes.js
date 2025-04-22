import express from 'express';
import { check } from 'express-validator';
import {
  registerUserController,
  loginUserController,
  getUserProfileController,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Register user
router.post(
  '/register',
  [
    check('username', 'Username is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({
      min: 6,
    }),
    check('fullName', 'Full name is required').notEmpty(),
  ],
  registerUserController
);

// Login user
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  loginUserController
);

// Get user profile
router.get('/profile', protect, getUserProfileController);

export default router;
