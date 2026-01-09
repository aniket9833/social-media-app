import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const usePostInteractions = (initialPosts = [], user) => {
  const [posts, setPosts] = useState(initialPosts);

  const handleLike = async (postId) => {
    try {
      await api.posts.like(postId);
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: [...post.likes, user._id],
              }
            : post
        )
      );
    } catch {
      toast.error("Failed to like post");
    }
  };

  const handleUnlike = async (postId) => {
    try {
      await api.posts.unlike(postId);
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes.filter((id) => id !== user._id),
              }
            : post
        )
      );
    } catch {
      toast.error("Failed to unlike post");
    }
  };

  const handleComment = async (postId, text) => {
    try {
      const response = await api.posts.comment(postId, text);
      const data = response.data;
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...post.comments, data] }
            : post
        )
      );
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleReply = (postId, commentId, updatedComment) => {
    setPosts(
      posts.map((post) =>
        post._id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment._id === commentId ? updatedComment : comment
              ),
            }
          : post
      )
    );
  };

  const handleBookmark = async (postId) => {
    try {
      await api.posts.bookmark(postId);
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                bookmarks: post.bookmarks.includes(user._id)
                  ? post.bookmarks.filter((id) => id !== user._id)
                  : [...post.bookmarks, user._id],
              }
            : post
        )
      );
    } catch {
      toast.error("Failed to bookmark post");
    }
  };

  return {
    posts,
    setPosts,
    handleLike,
    handleUnlike,
    handleComment,
    handleReply,
    handleBookmark,
  };
};
