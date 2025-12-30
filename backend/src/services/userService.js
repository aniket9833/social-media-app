import User from "../schema/user.js";
import Post from "../schema/post.js";
import FriendRequest from "../schema/friendRequest.js";
import Chat from "../schema/chat.js";

// Get user by username
const getUserByUsername = async (username) => {
  const user = await User.findOne({ username })
    .select("-password")
    .populate("followers", "username fullName profilePicture")
    .populate("following", "username fullName profilePicture");

  if (!user) {
    throw new Error("User not found");
  }

  // Fetch user's posts
  const posts = await Post.find({ user: user._id })
    .populate("user", "username fullName profilePicture")
    .populate("likes", "username")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username fullName profilePicture",
      },
    })
    .sort({ createdAt: -1 });

  return {
    ...user.toObject(),
    posts,
  };
};

// Update user profile
const updateUserProfile = async (userId, userData, file) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Update fields if provided
  if (userData.fullName) user.fullName = userData.fullName;
  if (userData.bio) user.bio = userData.bio;

  // Handle profile picture upload if any
  if (file) {
    user.profilePicture = file.location;
  }

  const updatedUser = await user.save();

  return {
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    fullName: updatedUser.fullName,
    profilePicture: updatedUser.profilePicture,
    bio: updatedUser.bio,
  };
};

// Follow user
const followUser = async (currentUserId, userToFollowId) => {
  if (currentUserId.toString() === userToFollowId.toString()) {
    throw new Error("You cannot follow yourself");
  }

  const userToFollow = await User.findById(userToFollowId);
  const currentUser = await User.findById(currentUserId);

  if (!userToFollow) {
    throw new Error("User not found");
  }

  // Check if already following
  if (currentUser.following.includes(userToFollowId)) {
    throw new Error("User already followed");
  }

  // Add to following and followers lists
  currentUser.following.push(userToFollowId);
  userToFollow.followers.push(currentUserId);

  await currentUser.save();
  await userToFollow.save();

  return {
    following: currentUser.following,
    message: `You are now following ${userToFollow.username}`,
  };
};

// Unfollow user
const unfollowUser = async (currentUserId, userToUnfollowId) => {
  if (currentUserId.toString() === userToUnfollowId.toString()) {
    throw new Error("You cannot unfollow yourself");
  }

  const userToUnfollow = await User.findById(userToUnfollowId);
  const currentUser = await User.findById(currentUserId);

  if (!userToUnfollow) {
    throw new Error("User not found");
  }

  // Check if not following
  if (!currentUser.following.includes(userToUnfollowId)) {
    throw new Error("You are not following this user");
  }

  // Remove from following and followers lists
  currentUser.following = currentUser.following.filter(
    (user) => user.toString() !== userToUnfollowId.toString()
  );

  userToUnfollow.followers = userToUnfollow.followers.filter(
    (user) => user.toString() !== currentUserId.toString()
  );

  await currentUser.save();
  await userToUnfollow.save();

  return {
    following: currentUser.following,
    message: `You have unfollowed ${userToUnfollow.username}`,
  };
};

// Send friend request
const sendFriendRequest = async (senderId, receiverId) => {
  if (senderId.toString() === receiverId.toString()) {
    throw new Error("You cannot send a friend request to yourself");
  }

  const receiver = await User.findById(receiverId);

  if (!receiver) {
    throw new Error("User not found");
  }

  // Check if friend request already exists
  const existingRequest = await FriendRequest.findOne({
    sender: senderId,
    receiver: receiverId,
  });

  if (existingRequest) {
    throw new Error("Friend request already sent");
  }

  // Check if they're already friends (reverse request accepted)
  const existingFriendship = await FriendRequest.findOne({
    sender: receiverId,
    receiver: senderId,
    status: "accepted",
  });

  if (existingFriendship) {
    throw new Error("You are already friends with this user");
  }

  // Create and save friend request
  const friendRequest = new FriendRequest({
    sender: senderId,
    receiver: receiverId,
  });

  await friendRequest.save();

  const populatedRequest = await FriendRequest.findById(friendRequest._id)
    .populate("sender", "username fullName profilePicture")
    .populate("receiver", "username fullName profilePicture");

  return populatedRequest;
};

// Accept friend request
const acceptFriendRequest = async (requestId, receiverId) => {
  const friendRequest = await FriendRequest.findById(requestId)
    .populate("sender", "username fullName profilePicture")
    .populate("receiver", "username fullName profilePicture");

  if (!friendRequest) {
    throw new Error("Friend request not found");
  }

  // Check if user is the receiver of the request
  if (friendRequest.receiver._id.toString() !== receiverId.toString()) {
    throw new Error("Not authorized");
  }

  // Check if request is pending
  if (friendRequest.status !== "pending") {
    throw new Error(`Friend request already ${friendRequest.status}`);
  }

  // Update request status
  friendRequest.status = "accepted";
  await friendRequest.save();

  // Create a chat for the new friends
  const chat = new Chat({
    participants: [friendRequest.sender._id, friendRequest.receiver._id],
  });

  await chat.save();

  return friendRequest;
};

// Reject friend request
const rejectFriendRequest = async (requestId, receiverId) => {
  const friendRequest = await FriendRequest.findById(requestId)
    .populate("sender", "username fullName profilePicture")
    .populate("receiver", "username fullName profilePicture");

  if (!friendRequest) {
    throw new Error("Friend request not found");
  }

  // Check if user is the receiver of the request
  if (friendRequest.receiver._id.toString() !== receiverId.toString()) {
    throw new Error("Not authorized");
  }

  // Check if request is pending
  if (friendRequest.status !== "pending") {
    throw new Error(`Friend request already ${friendRequest.status}`);
  }

  // Update request status
  friendRequest.status = "rejected";
  await friendRequest.save();

  return friendRequest;
};

// Get friend requests
const getFriendRequests = async (userId) => {
  const friendRequests = await FriendRequest.find({
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .populate("sender", "username fullName profilePicture")
    .populate("receiver", "username fullName profilePicture")
    .sort({ createdAt: -1 });

  return friendRequests;
};

// Get friends
const getFriends = async (userId) => {
  const friendRequests = await FriendRequest.find({
    $or: [
      { sender: userId, status: "accepted" },
      { receiver: userId, status: "accepted" },
    ],
  })
    .populate("sender", "username fullName profilePicture")
    .populate("receiver", "username fullName profilePicture");

  const friends = friendRequests.map((request) => {
    if (request.sender._id.toString() === userId.toString()) {
      return request.receiver;
    }
    return request.sender;
  });

  return friends;
};

// Search users
const searchUsers = async (query) => {
  const users = await User.find({
    $or: [
      { username: { $regex: query, $options: "i" } },
      { fullName: { $regex: query, $options: "i" } },
    ],
  })
    .select("username fullName profilePicture")
    .limit(10);

  return users;
};

export {
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
};
