import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Post from "../posts/Post";
import ProfileEdit from "../profile/ProfileEdit";
import FollowersModal from "../profile/FollowersModal";
import api from "../../services/api";
import toast from "react-hot-toast";
import { usePostInteractions } from "../../hooks/usePostInteractions";
import { BookmarkIcon, ChatIcon } from "@heroicons/react/outline";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
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
        // Unfollow
        await api.users.unfollow(profile._id);
        toast.success("Unfollowed successfully");
      } else {
        // Follow
        await api.users.follow(profile._id);
        toast.success("Followed successfully");
      }
      // Refetch profile to get updated followers/following data
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img
              src={profile.profilePicture || "/default-avatar.png"}
              alt={profile.username}
              className="w-20 h-20 rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold">{profile.username}</h2>
              <p className="text-gray-600">{profile.bio}</p>
            </div>
          </div>
          {user._id === profile._id ? (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Profile
              </button>
              <Link
                to="/bookmarks"
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center space-x-2"
              >
                <BookmarkIcon className="w-5 h-5" />
                <span>Bookmarks</span>
              </Link>
            </div>
          ) : (
            <>
              <button
                onClick={handleFollow}
                className={`px-4 py-2 rounded-lg transition-colors ${
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <ChatIcon className="w-5 h-5" />
                <span>Message</span>
              </button>
            </>
          )}
        </div>

        <div className="flex space-x-4 text-gray-600">
          <span
            className="cursor-pointer hover:text-gray-900"
            onClick={() => setShowFollowersModal(true)}
          >
            {posts.length} posts
          </span>
          <span
            className="cursor-pointer hover:text-gray-900"
            onClick={() => setShowFollowersModal(true)}
          >
            {profile.followers.length} followers
          </span>
          <span
            className="cursor-pointer hover:text-gray-900"
            onClick={() => setShowFollowingModal(true)}
          >
            {profile.following.length} following
          </span>
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
    </div>
  );
};

export default Profile;
