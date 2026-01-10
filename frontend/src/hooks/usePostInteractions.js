import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const usePostInteractions = (initialPosts = [], user) => {
  const [posts, setPosts] = useState(initialPosts);
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState(new Set());

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
      const isBookmarked = bookmarkedPostIds.has(postId);

      if (isBookmarked) {
        // Unbookmark
        await api.posts.unbookmark(postId);
        const newBookmarks = new Set(bookmarkedPostIds);
        newBookmarks.delete(postId);
        setBookmarkedPostIds(newBookmarks);
        toast.success("Bookmark removed");
      } else {
        // Bookmark
        await api.posts.bookmark(postId);
        const newBookmarks = new Set(bookmarkedPostIds);
        newBookmarks.add(postId);
        setBookmarkedPostIds(newBookmarks);
        toast.success("Post bookmarked");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to bookmark post");
    }
  };

  const isPostBookmarked = (postId) => {
    return bookmarkedPostIds.has(postId);
  };

  const handleEditPost = async (postId, newText) => {
    try {
      const response = await api.posts.update(postId, { text: newText });
      setPosts(
        posts.map((post) =>
          post._id === postId ? { ...post, text: response.data.text } : post
        )
      );
      toast.success("Post updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update post");
      throw error;
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.posts.delete(postId);
      setPosts(posts.filter((post) => post._id !== postId));
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete post");
      throw error;
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
    bookmarkedPostIds,
    setBookmarkedPostIds,
    isPostBookmarked,
    handleEditPost,
    handleDeletePost,
  };
};
