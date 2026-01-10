import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Post from "../posts/Post";
import toast from "react-hot-toast";
import api from "../../services/api";
import { usePostInteractions } from "../../hooks/usePostInteractions";

const Explore = () => {
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");
  const { user } = useAuth();
  const {
    posts,
    setPosts,
    handleLike,
    handleUnlike,
    handleComment,
    handleReply,
    handleBookmark,
    isPostBookmarked,
    handleEditPost,
    handleDeletePost,
  } = usePostInteractions([], user);

  const handleSort = (value) => {
    setSortBy(value);
  };

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
              isPostBookmarked={isPostBookmarked}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
