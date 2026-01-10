import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Post from "../posts/Post";
import ProfileEdit from "../profile/ProfileEdit";
import api from "../../services/api";
import toast from "react-hot-toast";
import { usePostInteractions } from "../../hooks/usePostInteractions";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { username } = useParams();
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
      const isFollowing = profile.followers.includes(user._id);
      if (isFollowing) {
        // Unfollow
        await api.users.unfollow(profile._id);
        setProfile((prev) => ({
          ...prev,
          followers: prev.followers.filter((id) => id !== user._id),
        }));
        toast.success("Unfollowed successfully");
      } else {
        // Follow
        await api.users.follow(profile._id);
        setProfile((prev) => ({
          ...prev,
          followers: [...prev.followers, user._id],
        }));
        toast.success("Followed successfully");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update follow status"
      );
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
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleFollow}
              className={`px-4 py-2 rounded-lg ${
                profile.followers.includes(user._id)
                  ? "bg-gray-200 text-gray-700"
                  : "bg-blue-600 text-white"
              }`}
            >
              {profile.followers.includes(user._id) ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>

        <div className="flex space-x-4 text-gray-600">
          <span>{posts.length} posts</span>
          <span>{profile.followers.length} followers</span>
          <span>{profile.following.length} following</span>
        </div>
      </div>

      {isEditing && (
        <ProfileEdit
          profile={profile}
          onClose={() => setIsEditing(false)}
          onUpdate={fetchProfile}
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
          />
        ))}
      </div>
    </div>
  );
};

export default Profile;
