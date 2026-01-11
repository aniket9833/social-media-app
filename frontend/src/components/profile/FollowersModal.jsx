import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const FollowersModal = ({ title, users, onClose, onFollowChange }) => {
  const [followingState, setFollowingState] = useState({});
  const { user } = useAuth();
  const [loading, setLoading] = useState({});

  useEffect(() => {
    // Fetch current user's following list to determine button states
    const fetchCurrentUserData = async () => {
      try {
        const response = await api.users.getProfile(user.username);

        // Initialize following state based on current user's following list
        const initialState = {};
        users.forEach((u) => {
          const isFollowing = response.data.following.some(
            (f) => f._id === u._id
          );
          initialState[u._id] = isFollowing;
        });
        setFollowingState(initialState);
      } catch (error) {
        console.error("Failed to fetch current user data:", error);
      }
    };

    fetchCurrentUserData();
  }, [users, user.username]);

  const handleFollowToggle = async (userId) => {
    setLoading({ ...loading, [userId]: true });
    try {
      if (followingState[userId]) {
        await api.users.unfollow(userId);
        setFollowingState({ ...followingState, [userId]: false });
        toast.success("Unfollowed");
      } else {
        await api.users.follow(userId);
        setFollowingState({ ...followingState, [userId]: true });
        toast.success("Followed");
      }
      if (onFollowChange) {
        onFollowChange();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update follow status"
      );
    } finally {
      setLoading({ ...loading, [userId]: false });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {users.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No users to display</p>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <Link
                  to={`/profile/${u.username}`}
                  className="flex items-center space-x-3 flex-1 min-w-0"
                  onClick={onClose}
                >
                  <img
                    src={u.profilePicture || "/default-avatar.png"}
                    alt={u.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{u.username}</p>
                    <p className="text-gray-600 text-xs truncate">
                      {u.fullName}
                    </p>
                  </div>
                </Link>

                {user._id !== u._id && (
                  <button
                    onClick={() => handleFollowToggle(u._id)}
                    disabled={loading[u._id]}
                    className={`ml-2 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                      followingState[u._id]
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } disabled:opacity-50`}
                  >
                    {followingState[u._id] ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowersModal;
