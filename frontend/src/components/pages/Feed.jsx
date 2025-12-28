import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Post from "../posts/Post";
import PostForm from "../posts/PostForm";
import toast from "react-hot-toast";
import api from "../../services/api";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.posts.getFeed();
      const data = response.data || response;
      setPosts(data.posts || []);
    } catch {
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.posts.like(postId);
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes.includes(user._id)
                  ? post.likes.filter((id) => id !== user._id)
                  : [...post.likes, user._id],
              }
            : post
        )
      );
    } catch {
      toast.error("Failed to like post");
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ content }),
        }
      );
      const data = await response.json();
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

  const handleBookmark = async (postId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/posts/${postId}/bookmark`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (response.ok) {
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
      }
    } catch {
      toast.error("Failed to bookmark post");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PostForm onPostCreated={fetchPosts} />
      <div className="space-y-4 mt-8">
        {posts.map((post) => (
          <Post
            key={post._id}
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onBookmark={handleBookmark}
          />
        ))}
      </div>
    </div>
  );
};

export default Feed;
