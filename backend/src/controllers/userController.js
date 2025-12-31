import { validationResult } from "express-validator";
import {
  getUserByUsername,
  updateUserProfile,
  followUser,
  unfollowUser,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriends,
  searchUsers,
} from "../services/userService.js";

// @desc    Get user by username
// @route   GET /api/users/:username
// @access  Private
const getUserByUsernameController = async (req, res) => {
  try {
    const result = await getUserByUsername(req.params.username);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.message === "User not found") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfileController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await updateUserProfile(req.user._id, req.body, req.file);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.message === "User not found") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Follow user
// @route   PUT /api/users/:id/follow
// @access  Private
const followUserController = async (req, res) => {
  try {
    const result = await followUser(req.user._id, req.params.id);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (
      error.message === "User not found" ||
      error.message === "You cannot follow yourself" ||
      error.message === "User already followed"
    ) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Unfollow user
// @route   PUT /api/users/:id/unfollow
// @access  Private
const unfollowUserController = async (req, res) => {
  try {
    const result = await unfollowUser(req.user._id, req.params.id);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (
      error.message === "User not found" ||
      error.message === "You cannot unfollow yourself" ||
      error.message === "You are not following this user"
    ) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Send friend request
// @route   POST /api/users/:id/friend-request
// @access  Private
const sendFriendRequestController = async (req, res) => {
  try {
    const result = await sendFriendRequest(req.user._id, req.params.id);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    if (
      error.message === "User not found" ||
      error.message === "You cannot send a friend request to yourself" ||
      error.message === "Friend request already sent" ||
      error.message === "You are already friends with this user"
    ) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Accept friend request
// @route   PUT /api/users/friend-request/:requestId/accept
// @access  Private
const acceptFriendRequestController = async (req, res) => {
  try {
    const result = await acceptFriendRequest(
      req.params.requestId,
      req.user._id
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    if (
      error.message === "Friend request not found" ||
      error.message === "Not authorized" ||
      error.message.includes("Friend request already")
    ) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Reject friend request
// @route   PUT /api/users/friend-request/:requestId/reject
// @access  Private
const rejectFriendRequestController = async (req, res) => {
  try {
    const result = await rejectFriendRequest(
      req.params.requestId,
      req.user._id
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    if (
      error.message === "Friend request not found" ||
      error.message === "Not authorized" ||
      error.message.includes("Friend request already")
    ) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Get friend requests
// @route   GET /api/users/friend-requests
// @access  Private
const getFriendRequestsController = async (req, res) => {
  try {
    const result = await getFriendRequests(req.user._id);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get friends
// @route   GET /api/users/friends
// @access  Private
const getFriendsController = async (req, res) => {
  try {
    const result = await getFriends(req.user._id);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
const searchUsersController = async (req, res) => {
  try {
    const query = req.query.query || req.query.q || "";
    if (!query.trim()) {
      return res.json({ users: [] });
    }
    const result = await searchUsers(query);
    res.json({ users: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export {
  getUserByUsernameController,
  updateUserProfileController,
  followUserController,
  unfollowUserController,
  sendFriendRequestController,
  acceptFriendRequestController,
  rejectFriendRequestController,
  getFriendRequestsController,
  getFriendsController,
  searchUsersController,
};
