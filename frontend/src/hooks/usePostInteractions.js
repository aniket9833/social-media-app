import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const usePostInteractions = (initialPosts = [], user) => {
  const [posts, setPosts] = useState(initialPosts);
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState(new Set());

  const getIdString = (value) => {
    if (value == null) return "";
    const id = typeof value === "object" ? value._id : value;
    return id != null ? id.toString() : "";
  };

  const handleLike = async (postId) => {
    const normalizedPostId = getIdString(postId);
    if (!normalizedPostId) {
      toast.error("Invalid post id");
      return;
    }
    try {
      await api.posts.like(normalizedPostId);
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (getIdString(post._id) !== normalizedPostId) return post;
          const likes = Array.isArray(post.likes) ? post.likes : [];
          const alreadyLiked = likes.some(
            (like) => getIdString(like) === getIdString(user?._id)
          );
          if (alreadyLiked) return post;
          return {
            ...post,
            likes: [...likes, user._id],
          };
        })
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to like post");
    }
  };

  const handleUnlike = async (postId) => {
    const normalizedPostId = getIdString(postId);
    if (!normalizedPostId) {
      toast.error("Invalid post id");
      return;
    }
    try {
      await api.posts.unlike(normalizedPostId);
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (getIdString(post._id) !== normalizedPostId) return post;
          const likes = Array.isArray(post.likes) ? post.likes : [];
          const myId = getIdString(user?._id);
          return {
            ...post,
            likes: likes.filter((like) => getIdString(like) !== myId),
          };
        })
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unlike post");
    }
  };

  const handleComment = async (postId, text) => {
    try {
      const response = await api.posts.comment(postId, text);
      const data = response.data;
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), data],
              }
            : post
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment");
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
