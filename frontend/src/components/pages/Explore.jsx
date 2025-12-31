import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Post from "../posts/Post";
import toast from "react-hot-toast";
import api from "../../services/api";

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.posts.getExplore(sortBy);
        const data = response.data || response;
        setPosts(data.posts || []);
      } catch {
        toast.error("Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [sortBy]);

  const handleSort = (value) => {
    setSortBy(value);
  };

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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">Explore Posts</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => handleSort("recent")}
            className={`px-4 py-2 rounded-lg ${
              sortBy === "recent"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => handleSort("trending")}
            className={`px-4 py-2 rounded-lg ${
              sortBy === "trending"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Trending
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Post
              key={post._id}
              post={post}
              onLike={handleLike}
              onUnlike={handleUnlike}
              onComment={handleComment}
              onReply={handleReply}
              onBookmark={handleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
