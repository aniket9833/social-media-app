import Post from '../schema/post.js';
import User from '../schema/user.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../config/awsConfig.js';

// Create a new post
const createPost = async (userId, postData, files) => {
  const { text, tags } = postData;
  const media = [];

  // Handle file uploads if any
  if (files && files.length > 0) {
    files.forEach((file) => {
      let type = 'image';
      if (file.mimetype.startsWith('video')) {
        type = 'video';
      } else if (file.mimetype.startsWith('audio')) {
        type = 'audio';
      }

      media.push({
        url: file.location,
        type,
      });
    });
  }

  // Create post
  const post = new Post({
    user: userId,
    text,
    media,
    tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
  });

  const savedPost = await post.save();
  await savedPost.populate('user', 'username fullName profilePicture');

  return savedPost;
};

// Get feed posts
const getFeedPosts = async (userId, page = 1, limit = 10, sort = 'recent') => {
  // Get list of users the current user is following
  const user = await User.findById(userId);
  const following = user.following;
  following.push(userId);

  // Define sort options
  let sortOption = {};
  if (sort === 'recent') {
    sortOption = { createdAt: -1 };
  } else if (sort === 'trending') {
    sortOption = { likeCount: -1 };
  } else {
    sortOption = { createdAt: -1 }; // Default to recent
  }

  // Get paginated posts
  const skip = (page - 1) * limit;

  const posts = await Post.find({ user: { $in: following } })
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .populate('user', 'username fullName profilePicture')
    .populate({
      path: 'comments',
      select: 'text user createdAt',
      populate: {
        path: 'user',
        select: 'username fullName profilePicture',
      },
    });

  // Get total posts count for pagination info
  const total = await Post.countDocuments({ user: { $in: following } });

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Get explore posts
const getExplorePosts = async (page = 1, limit = 10, sort = 'recent') => {
  // Define sort options
  let sortOption = {};
  if (sort === 'recent') {
    sortOption = { createdAt: -1 };
  } else if (sort === 'trending') {
    sortOption = { likeCount: -1 };
  } else {
    sortOption = { createdAt: -1 }; // Default to recent
  }

  // Get paginated posts
  const skip = (page - 1) * limit;

  const posts = await Post.find()
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .populate('user', 'username fullName profilePicture')
    .populate({
      path: 'comments',
      select: 'text user createdAt',
      populate: {
        path: 'user',
        select: 'username fullName profilePicture',
      },
    });

  // Get total posts count for pagination info
  const total = await Post.countDocuments();

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Get post by ID
const getPostById = async (postId) => {
  const post = await Post.findById(postId)
    .populate('user', 'username fullName profilePicture')
    .populate({
      path: 'comments',
      select: 'text user createdAt',
      populate: {
        path: 'user',
        select: 'username fullName profilePicture',
      },
    });

  if (!post) {
    throw new Error('Post not found');
  }

  return post;
};

// Update a post
const updatePost = async (postId, userId, postData, files) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new Error('Post not found');
  }

  // Check post belongs to user
  if (post.user.toString() !== userId.toString()) {
    throw new Error('User not authorized');
  }

  // Update fields
  if (postData.text) post.text = postData.text;
  if (postData.tags) {
    post.tags = postData.tags.split(',').map((tag) => tag.trim());
  }

  // Handle new media uploads if any
  if (files && files.length > 0) {
    const newMedia = [];

    files.forEach((file) => {
      let type = 'image';
      if (file.mimetype.startsWith('video')) {
        type = 'video';
      } else if (file.mimetype.startsWith('audio')) {
        type = 'audio';
      }

      newMedia.push({
        url: file.location,
        type,
      });
    });

    // Replace or append media based on request
    if (postData.replaceMedia === 'true') {
      // Delete old media from S3
      for (const media of post.media) {
        const key = media.url.split('/').pop();
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          })
        );
      }
      post.media = newMedia;
    } else {
      post.media = [...post.media, ...newMedia];
    }
  }

  const updatedPost = await post.save();
  await updatedPost.populate('user', 'username fullName profilePicture');

  return updatedPost;
};

// Delete a post
const deletePost = async (postId, userId) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new Error('Post not found');
  }

  // Check post belongs to user
  if (post.user.toString() !== userId.toString()) {
    throw new Error('User not authorized');
  }

  // Delete media files from S3
  for (const media of post.media) {
    const key = media.url.split('/').pop();
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      })
    );
  }

  await post.deleteOne();
};

// Like a post
const likePost = async (postId, userId) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new Error('Post not found');
  }

  // Check if post has already been liked
  const alreadyLiked = post.likes.some(
    (id) => id.toString() === userId.toString()
  );
  if (alreadyLiked) {
    throw new Error('Post already liked');
  }

  post.likes.push(userId);
  post.likeCount = post.likes.length;
  await post.save();

  return post;
};

// Unlike a post
const unlikePost = async (postId, userId) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new Error('Post not found');
  }

  // Check if post has been liked
  const hasLiked = post.likes.some((id) => id.toString() === userId.toString());
  if (!hasLiked) {
    throw new Error('Post not liked');
  }

  post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
  post.likeCount = post.likes.length;
  await post.save();

  return post;
};

// Bookmark a post
const bookmarkPost = async (postId, userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Check if post exists
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  // Check if post is already bookmarked
  if (user.bookmarks.includes(postId)) {
    throw new Error('Post already bookmarked');
  }

  user.bookmarks.push(postId);
  await user.save();

  return user;
};

// Unbookmark a post
const unbookmarkPost = async (postId, userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Check if post exists
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  // Check if post is bookmarked
  if (!user.bookmarks.includes(postId)) {
    throw new Error('Post not bookmarked');
  }

  user.bookmarks = user.bookmarks.filter(
    (id) => id.toString() !== postId.toString()
  );
  await user.save();

  return user;
};

// Get bookmarked posts
const getBookmarkedPosts = async (userId, page = 1, limit = 10) => {
  const user = await User.findById(userId).select('bookmarks');

  if (!user) {
    throw new Error('User not found');
  }

  const skip = (page - 1) * limit;

  const posts = await Post.find({ _id: { $in: user.bookmarks } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'username fullName profilePicture')
    .populate({
      path: 'comments',
      select: 'text user createdAt',
      populate: {
        path: 'user',
        select: 'username fullName profilePicture',
      },
    });

  const total = user.bookmarks.length;

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export {
  createPost,
  getFeedPosts,
  getExplorePosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  bookmarkPost,
  unbookmarkPost,
  getBookmarkedPosts,
};
