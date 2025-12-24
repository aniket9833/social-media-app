import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Post from '../posts/Post';
import ProfileEdit from '../profile/ProfileEdit';
import toast from 'react-hot-toast';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { username } = useParams();
  const { user } = useAuth();

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${username}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      const data = await response.json();
      setProfile(data);
      setPosts(data.posts);
    } catch {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [username, user.token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  const fetchAdditionalProfile = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${username}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      const data = await response.json();
      setProfile(data);
      setPosts(data.posts);
    } catch {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  fetchAdditionalProfile();

  const handleFollow = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${profile._id}/follow`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (response.ok) {
        setProfile((prev) => ({
          ...prev,
          followers: prev.followers.includes(user._id)
            ? prev.followers.filter((id) => id !== user._id)
            : [...prev.followers, user._id],
        }));
      }
    } catch {
      toast.error('Failed to update follow status');
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
              src={profile.avatar || '/default-avatar.png'}
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
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {profile.followers.includes(user._id) ? 'Unfollow' : 'Follow'}
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
          <Post key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Profile;
