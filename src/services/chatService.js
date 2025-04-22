import Chat from '../schema/chat.js';
import Message from '../schema/message.js';
import User from '../schema/user.js';
import FriendRequest from '../schema/friendRequest.js';

// Get user's chats
const getUserChats = async (userId) => {
  // Find all chats where user is a participant
  const chats = await Chat.find({
    participants: { $in: [userId] },
  })
    .populate('participants', 'username fullName profilePicture')
    .populate({
      path: 'messages',
      options: { sort: { createdAt: -1 }, limit: 1 },
      populate: { path: 'sender', select: 'username' },
    })
    .sort({ updatedAt: -1 });

  return chats;
};

// Get single chat
const getChatById = async (chatId, userId) => {
  const chat = await Chat.findById(chatId).populate(
    'participants',
    'username fullName profilePicture'
  );

  if (!chat) {
    throw new Error('Chat not found');
  }

  // Check if user is participant
  if (!chat.participants.some((p) => p._id.toString() === userId.toString())) {
    throw new Error('Access denied');
  }

  // Get messages with pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const messages = await Message.find({ chat: chatId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'username fullName profilePicture');

  // Update readBy field for unread messages
  await Message.updateMany(
    {
      chat: chatId,
      sender: { $ne: userId },
      readBy: { $nin: [userId] },
    },
    { $push: { readBy: userId } }
  );

  return {
    chat,
    messages: messages.reverse(), // Return in chronological order
    pagination: {
      page,
      limit,
      hasMore: messages.length === limit,
    },
  };
};

// Get or create chat with another user
const getChatWithUser = async (userId, otherUserId) => {
  const otherUser = await User.findById(otherUserId);

  if (!otherUser) {
    throw new Error('User not found');
  }

  // Check if they are friends
  const areFriends = await FriendRequest.findOne({
    $or: [
      {
        sender: userId,
        receiver: otherUserId,
        status: 'accepted',
      },
      {
        sender: otherUserId,
        receiver: userId,
        status: 'accepted',
      },
    ],
  });

  if (!areFriends) {
    throw new Error('You need to be friends to start a chat');
  }

  // Check if chat already exists
  let chat = await Chat.findOne({
    participants: { $all: [userId, otherUserId] },
  }).populate('participants', 'username fullName profilePicture');

  // If chat doesn't exist, create it
  if (!chat) {
    chat = new Chat({
      participants: [userId, otherUserId],
    });

    await chat.save();

    // Populate participants
    chat = await Chat.findById(chat._id).populate(
      'participants',
      'username fullName profilePicture'
    );
  }

  return chat;
};

// Send a message
const sendMessage = async (chatId, userId, messageData, file) => {
  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new Error('Chat not found');
  }

  // Check if user is participant
  if (!chat.participants.some((p) => p.toString() === userId.toString())) {
    throw new Error('Access denied');
  }

  // Create message
  const message = new Message({
    chat: chatId,
    sender: userId,
    text: messageData.text,
    readBy: [userId], // Mark as read by sender
  });

  // Handle media upload if any
  if (file) {
    let type = 'image';
    if (file.mimetype.startsWith('video')) {
      type = 'video';
    } else if (file.mimetype.startsWith('audio')) {
      type = 'audio';
    }

    message.media = {
      url: file.location,
      type,
    };
  }

  const savedMessage = await message.save();

  // Add message to chat
  chat.messages.push(savedMessage._id);
  await chat.save();

  // Populate sender info
  await savedMessage.populate('sender', 'username fullName profilePicture');

  return savedMessage;
};

export { getUserChats, getChatById, getChatWithUser, sendMessage }; 