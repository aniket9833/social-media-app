import { validationResult } from "express-validator";
import {
  createComment,
  deleteComment,
  getPostComments,
  createReply,
  deleteReply,
} from "../services/commentService.js";

// @desc    Create a comment
// @route   POST /api/comments/:postId
// @access  Private
const createCommentController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await createComment(
      req.user._id,
      req.params.postId,
      req.body.text
    );
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    if (error.message === "Post not found") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private
const deleteCommentController = async (req, res) => {
  try {
    await deleteComment(req.params.commentId, req.user._id);
    res.json({ message: "Comment removed" });
  } catch (error) {
    console.error(error);
    if (
      error.message === "Comment not found" ||
      error.message === "User not authorized"
    ) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Get comments for a post
// @route   GET /api/comments/:postId
// @access  Private
const getPostCommentsController = async (req, res) => {
  try {
    const result = await getPostComments(req.params.postId);
    res.json(result);
  } catch (error) {
    console.error(error);
    if (error.message === "Post not found") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Create a reply to a comment
// @route   POST /api/posts/comments/:commentId/reply
// @access  Private
const createReplyController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await createReply(
      req.user._id,
      req.params.commentId,
      req.body.text
    );
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    if (error.message === "Comment not found") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Delete a reply
// @route   DELETE /api/posts/comments/:commentId/reply/:replyId
// @access  Private
const deleteReplyController = async (req, res) => {
  try {
    await deleteReply(req.params.commentId, req.params.replyId, req.user._id);
    res.json({ message: "Reply removed" });
  } catch (error) {
    console.error(error);
    if (
      error.message === "Comment not found" ||
      error.message === "Reply not found" ||
      error.message === "User not authorized"
    ) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

export {
  createCommentController,
  deleteCommentController,
  getPostCommentsController,
  createReplyController,
  deleteReplyController,
};
