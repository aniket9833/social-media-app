import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ChatIcon, BookmarkIcon } from '@heroicons/react/outline';
import { useAuth } from '../../context/AuthContext';

const Post = ({ post, onLike, onComment, onBookmark }) => {
  const [comment, setComment] = useState('');
  const { user } = useAuth();

  const handleSubmitComment = (e) => {
    e.preventDefault();
    onComment(post._id, comment);
    setComment('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img
            src={post.author.avatar || '/default-avatar.png'}
            alt={post.author.username}
            className="w-10 h-10 rounded-full mr-3"
          />
        </Link>
        <div>
          <Link
            to={`/profile/${post.author.username}`}
            className="font-semibold text-gray-900 hover:underline"
          >
            {post.author.username}
          </Link>
          <p className="text-gray-500 text-sm">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <p className="text-gray-800 mb-4">{post.content}</p>
      {post.image && (
        <img
          src={post.image}
          alt="Post content"
          className="rounded-lg max-h-96 w-full object-cover mb-4"
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onLike(post._id)}
            className={`flex items-center space-x-1 ${
              post.likes.includes(user._id) ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            <HeartIcon className="w-5 h-5" />
            <span>{post.likes.length}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500">
            <ChatIcon className="w-5 h-5" />
            <span>{post.comments.length}</span>
          </button>
          <button
            onClick={() => onBookmark(post._id)}
            className={`flex items-center space-x-1 ${
              post.bookmarks.includes(user._id)
                ? 'text-blue-500'
                : 'text-gray-500'
            }`}
          >
            <BookmarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmitComment} className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!comment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Post
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {post.comments.map((comment) => (
          <div key={comment._id} className="flex items-start space-x-2">
            <Link to={`/profile/${comment.author.username}`}>
              <img
                src={comment.author.avatar || '/default-avatar.png'}
                alt={comment.author.username}
                className="w-8 h-8 rounded-full"
              />
            </Link>
            <div className="flex-1 bg-gray-50 rounded-lg p-2">
              <Link
                to={`/profile/${comment.author.username}`}
                className="font-semibold text-sm text-gray-900 hover:underline"
              >
                {comment.author.username}
              </Link>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Post;
