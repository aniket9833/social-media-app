import Comment from '../schema/comment.js';
import Post from '../schema/post.js';

// Create a comment
const createComment = async (userId, postId, text) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new Error('Post not found');
  }

  // Create comment
  const comment = new Comment({
    user: userId,
    post: postId,
    text,
  });

  const savedComment = await comment.save();

  // Add comment to post's comments array
  post.comments.push(savedComment._id);
  await post.save();

  // Populate user info
  await savedComment.populate('user', 'username fullName profilePicture');

  return savedComment;
};

// Delete a comment
const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new Error('Comment not found');
  }

  // Check comment belongs to user
  if (comment.user.toString() !== userId.toString()) {
    throw new Error('User not authorized');
  }

  // Remove comment from post's comments array
  const post = await Post.findById(comment.post);
  if (post) {
    post.comments = post.comments.filter(
      (id) => id.toString() !== commentId.toString()
    );
    await post.save();
  }

  // Delete comment
  await Comment.deleteOne({ _id: commentId });
};

// Get comments for a post
const getPostComments = async (postId) => {
  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .populate('user', 'username fullName profilePicture');

  return comments;
};

export { createComment, deleteComment, getPostComments }; 