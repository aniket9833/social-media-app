import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Post from "../posts/Post";
import toast from "react-hot-toast";
import api from "../../services/api";
import { usePostInteractions } from "../../hooks/usePostInteractions";
import { BookmarkIcon } from "@heroicons/react/outline";

const Bookmarks = () => {
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
    setBookmarkedPostIds,
    isPostBookmarked,
    handleEditPost,
    handleDeletePost,
  } = usePostInteractions([], user);

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      try {
        const response = await api.posts.getBookmarks();
        const data = response.data || response;
        setPosts(data.posts || []);

        // Initialize bookmarkedPostIds with the fetched posts
        const bookmarkSet = new Set();
        (data.posts || []).forEach((post) => {
          bookmarkSet.add(post._id);
        });
        setBookmarkedPostIds(bookmarkSet);
      } catch {
        toast.error("Failed to fetch bookmarked posts");
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkedPosts();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-3">
          <BookmarkIcon className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold">My Bookmarks</h2>
        </div>
        <p className="text-gray-600 mt-2">
          {posts.length} saved {posts.length === 1 ? "post" : "posts"}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <BookmarkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            You haven't bookmarked any posts yet
          </p>
          <p className="text-gray-400 mt-2">
            Bookmark posts to save them for later
          </p>
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

export default Bookmarks;
