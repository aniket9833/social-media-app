import { validationResult } from 'express-validator';
import { registerUser, loginUser, getUserProfile } from '../services/authService.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUserController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUserController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await loginUser(req.body.email, req.body.password);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfileController = async (req, res) => {
  try {
    const user = await getUserProfile(req.user._id);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
};

export { registerUserController, loginUserController, getUserProfileController };
