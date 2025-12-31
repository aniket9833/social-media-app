import Comment from "../schema/comment.js";
import Post from "../schema/post.js";

// Create a comment
const createComment = async (userId, postId, text) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new Error("Post not found");
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
  await savedComment.populate("user", "username fullName profilePicture");

  return savedComment;
};

// Delete a comment
const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new Error("Comment not found");
  }

  // Check comment belongs to user
  if (comment.user.toString() !== userId.toString()) {
    throw new Error("User not authorized");
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
    .populate("user", "username fullName profilePicture")
    .populate({
      path: "replies.user",
      select: "username fullName profilePicture",
    });

  return comments;
};

// Create a reply to a comment
const createReply = async (userId, commentId, text) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new Error("Comment not found");
  }

  // Add reply to comment's replies array
  comment.replies.push({
    user: userId,
    text,
  });

  const updatedComment = await comment.save();

  // Populate user info for the reply
  await updatedComment.populate("user", "username fullName profilePicture");
  await updatedComment.populate({
    path: "replies.user",
    select: "username fullName profilePicture",
  });

  return updatedComment;
};

// Delete a reply
const deleteReply = async (commentId, replyId, userId) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new Error("Comment not found");
  }

  // Find the reply
  const reply = comment.replies.id(replyId);
  if (!reply) {
    throw new Error("Reply not found");
  }

  // Check reply belongs to user
  if (reply.user.toString() !== userId.toString()) {
    throw new Error("User not authorized");
  }

  // Remove reply
  comment.replies.id(replyId).deleteOne();
  await comment.save();
};

export {
  createComment,
  deleteComment,
  getPostComments,
  createReply,
  deleteReply,
};
