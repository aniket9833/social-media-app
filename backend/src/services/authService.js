import User from '../schema/user.js';
import jwt from 'jsonwebtoken';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register a new user
const registerUser = async (userData) => {
  const { username, email, password, fullName } = userData;

  // Check if user already exists
  const userExists = await User.findOne({ $or: [{ email }, { username }] });

  if (userExists) {
    throw new Error('User already exists');
  }

  // Create new user
  const user = await User.create({
    username,
    email,
    password,
    fullName,
  });

  if (!user) {
    throw new Error('Invalid user data');
  }

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    token: generateToken(user._id),
  };
};

// Login user
const loginUser = async (email, password) => {
  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    profilePicture: user.profilePicture,
    token: generateToken(user._id),
  };
};

// Get user profile
const getUserProfile = async (userId) => {
  const user = await User.findById(userId)
    .select('-password')
    .populate('followers', 'username fullName profilePicture')
    .populate('following', 'username fullName profilePicture');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export { registerUser, loginUser, getUserProfile };
