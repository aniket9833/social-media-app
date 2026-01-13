import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Post from "../posts/Post";
import ProfileEdit from "../profile/ProfileEdit";
import FollowersModal from "../profile/FollowersModal";
import api from "../../services/api";
import toast from "react-hot-toast";
import { usePostInteractions } from "../../hooks/usePostInteractions";
import {
  BookmarkIcon,
  ChatIcon,
  HeartIcon,
  XIcon,
} from "@heroicons/react/outline";
import {
  HeartIcon as HeartIconSolid,
  ChatAltIcon,
  BookmarkIcon as BookmarkIconSolid,
} from "@heroicons/react/solid";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.users.getProfile(username);
      setProfile(response.data);
      setPosts(response.data.posts || []);
    } catch {
      toast.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, [username, setPosts]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFollow = async () => {
    try {
      const isFollowing =
        profile.followers && profile.followers.some((f) => f._id === user._id);
      if (isFollowing) {
        await api.users.unfollow(profile._id);
        toast.success("Unfollowed successfully");
      } else {
        await api.users.follow(profile._id);
        toast.success("Followed successfully");
      }
      await fetchProfile();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update follow status"
      );
    }
  };

  const handleSendMessage = async () => {
    try {
      const response = await api.chats.getOrCreateWithUser(profile._id);
      navigate(`/messages/${response.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start chat");
    }
  };

  const handlePostClick = (post) => {
    setSelectedPostId(post._id);
  };

  const closePostModal = () => {
    setSelectedPostId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
          <img
            src={profile.profilePicture || "/default-avatar.png"}
            alt={profile.username}
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
          />

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h2 className="text-3xl font-bold">{profile.username}</h2>

              {user._id === profile._id ? (
                <div className="flex gap-2 justify-center md:justify-start">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                  <Link
                    to="/bookmarks"
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center space-x-2 text-sm font-medium"
                  >
                    <BookmarkIcon className="w-4 h-4" />
                    <span>Bookmarks</span>
                  </Link>
                </div>
              ) : (
                <div className="flex gap-2 justify-center md:justify-start">
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-lg transition-colors text-sm font-medium ${
                      profile.followers &&
                      profile.followers.some((f) => f._id === user._id)
                        ? "bg-gray-300 text-gray-800 hover:bg-gray-400"
                        : profile.following &&
                          profile.following.some((f) => f._id === user._id)
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {profile.followers &&
                    profile.followers.some((f) => f._id === user._id)
                      ? "Following"
                      : profile.following &&
                        profile.following.some((f) => f._id === user._id)
                      ? "Follow Back"
                      : "Follow"}
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 text-sm font-medium"
                  >
                    <ChatIcon className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                </div>
              )}
            </div>

            <p className="text-gray-600 mb-4">{profile.bio}</p>

            <div className="flex gap-8 justify-center md:justify-start text-sm">
              <div className="text-center md:text-left">
                <span className="font-bold text-lg">{posts.length}</span>
                <span className="text-gray-600 ml-1">posts</span>
              </div>
              <div
                className="cursor-pointer hover:text-gray-900 text-center md:text-left"
                onClick={() => setShowFollowersModal(true)}
              >
                <span className="font-bold text-lg">
                  {profile.followers.length}
                </span>
                <span className="text-gray-600 ml-1">followers</span>
              </div>
              <div
                className="cursor-pointer hover:text-gray-900 text-center md:text-left"
                onClick={() => setShowFollowingModal(true)}
              >
                <span className="font-bold text-lg">
                  {profile.following.length}
                </span>
                <span className="text-gray-600 ml-1">following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <ProfileEdit
          profile={profile}
          onClose={() => setIsEditing(false)}
          onUpdate={fetchProfile}
        />
      )}

      {showFollowersModal && (
        <FollowersModal
          title="Followers"
          users={profile.followers}
          onClose={() => setShowFollowersModal(false)}
          onFollowChange={fetchProfile}
        />
      )}

      {showFollowingModal && (
        <FollowersModal
          title="Following"
          users={profile.following}
          onClose={() => setShowFollowingModal(false)}
          onFollowChange={fetchProfile}
        />
      )}

      {/* Posts Grid */}
      <div className="border-t border-gray-300 pt-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {posts.map((post) => {
              // Get the first media URL if exists
              const postImage =
                post.media && post.media.length > 0 ? post.media[0].url : null;
              const postContent = post.text;

              return (
                <div
                  key={post._id}
                  className="relative aspect-square cursor-pointer group overflow-hidden bg-gray-200 rounded-sm"
                  onClick={() => handlePostClick(post)}
                >
                  {postImage ? (
                    <>
                      <img
                        src={postImage}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-6 text-white">
                          <div className="flex items-center gap-2">
                            <HeartIconSolid className="w-6 h-6" />
                            <span className="font-semibold">
                              {post.likes?.length || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChatAltIcon className="w-6 h-6" />
                            <span className="font-semibold">
                              {post.comments?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : postContent ? (
                    <>
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
                        <p className="text-gray-700 text-xs md:text-sm line-clamp-6 text-center font-medium">
                          {postContent}
                        </p>
                      </div>
                      {/* Hover overlay for text posts */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-6 text-white">
                          <div className="flex items-center gap-2">
                            <HeartIconSolid className="w-6 h-6" />
                            <span className="font-semibold">
                              {post.likes?.length || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChatAltIcon className="w-6 h-6" />
                            <span className="font-semibold">
                              {post.comments?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 p-4">
                        <div className="text-center">
                          <p className="text-gray-700 text-sm font-medium mb-2">
                            Post
                          </p>
                          <p className="text-xs text-gray-600">Click to view</p>
                        </div>
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-6 text-white">
                          <div className="flex items-center gap-2">
                            <HeartIconSolid className="w-6 h-6" />
                            <span className="font-semibold">
                              {post.likes?.length || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChatAltIcon className="w-6 h-6" />
                            <span className="font-semibold">
                              {post.comments?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Post Modal */}
      {selectedPostId && (() => {
        const selectedPost = posts.find((p) => p._id === selectedPostId);
        return selectedPost ? (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
              <button
                onClick={closePostModal}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <XIcon className="w-6 h-6 text-gray-700" />
              </button>

              <div className="overflow-y-auto max-h-[90vh] pt-12">
                <Post
                  post={selectedPost}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                  onComment={handleComment}
                  onReply={handleReply}
                  onBookmark={handleBookmark}
                  isPostBookmarked={isPostBookmarked}
                  onEditPost={handleEditPost}
                  onDeletePost={(postId) => {
                    handleDeletePost(postId);
                    closePostModal();
                  }}
                />
              </div>
            </div>
          </div>
        ) : null;
      })()}
    </div>
  );
};

export default Profile;
