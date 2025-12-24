import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Post from '../posts/Post';
import toast from 'react-hot-toast';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/posts?sort=${sortBy}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      const data = await response.json();
      setPosts(data);
    } catch {
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (value) => {
    setSortBy(value);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">Explore Posts</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => handleSort('recent')}
            className={`px-4 py-2 rounded-lg ${
              sortBy === 'recent'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => handleSort('trending')}
            className={`px-4 py-2 rounded-lg ${
              sortBy === 'trending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
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
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
