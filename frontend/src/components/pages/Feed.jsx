import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Post from "../posts/Post";
import PostForm from "../posts/PostForm";
import toast from "react-hot-toast";
import api from "../../services/api";
import { usePostInteractions } from "../../hooks/usePostInteractions";

const Feed = () => {
  const [loading, setLoading] = useState(true);
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
  } = usePostInteractions([], user);

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

  useEffect(() => {
    fetchPosts();
  }, []);

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
            onUnlike={handleUnlike}
            onComment={handleComment}
            onReply={handleReply}
            onBookmark={handleBookmark}
            isPostBookmarked={isPostBookmarked}
          />
        ))}
      </div>
    </div>
  );
};

export default Feed;
