import express from 'express';
import { check } from 'express-validator';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  getUserByUsernameController,
  updateUserProfileController,
  followUserController,
  unfollowUserController,
  sendFriendRequestController,
  acceptFriendRequestController,
  rejectFriendRequestController,
  getFriendRequestsController,
  getFriendsController,
  searchUsersController
} from '../controllers/userController.js';

const router = express.Router();

// Search users
router.get('/search', protect, searchUsersController);

// Get friend requests
router.get('/friend-requests', protect, getFriendRequestsController);

// Get friends
router.get('/friends', protect, getFriendsController);

// Accept friend request
router.put('/friend-request/:requestId/accept', protect, acceptFriendRequestController);

// Reject friend request
router.put('/friend-request/:requestId/reject', protect, rejectFriendRequestController);

// Update profile
router.put(
  '/profile',
  protect,
  upload.single('profilePicture'),
  [
    check('fullName', 'Full name is required').not().isEmpty(),
    check('bio', 'Bio must be less than 500 characters').isLength({ max: 500 })
  ],
  updateUserProfileController
);

// Get user by username
router.get('/:username', protect, getUserByUsernameController);

// Follow user
router.put('/:id/follow', protect, followUserController);

// Unfollow user
router.put('/:id/unfollow', protect, unfollowUserController);

// Send friend request
router.post('/:id/friend-request', protect, sendFriendRequestController);

export default router; 