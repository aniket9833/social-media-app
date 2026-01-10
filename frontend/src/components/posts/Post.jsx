import { useState } from "react";
import { Link } from "react-router-dom";
import { HeartIcon, ChatIcon, BookmarkIcon } from "@heroicons/react/outline";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import api from "../../services/api";

const Post = ({
  post,
  onLike,
  onUnlike,
  onComment,
  onBookmark,
  onReply,
  isPostBookmarked,
}) => {
  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const { user } = useAuth();

  const handleLikeClick = () => {
    if (post.likes && post.likes.includes(user._id)) {
      onUnlike(post._id);
    } else {
      onLike(post._id);
    }
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    onComment(post._id, comment);
    setComment("");
  };

  const handleSubmitReply = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const response = await api.posts.reply(commentId, replyText);
      onReply(post._id, commentId, response.data);
      setReplyText("");
      setReplyingTo(null);
    } catch {
      toast.error("Failed to add reply");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center mb-4">
        <Link to={`/profile/${post.user.username}`}>
          <img
            src={post.user.profilePicture || "/default-avatar.png"}
            alt={post.user.username}
            className="w-10 h-10 rounded-full mr-3"
          />
        </Link>
        <div>
          <Link
            to={`/profile/${post.user.username}`}
            className="font-semibold text-gray-900 hover:underline"
          >
            {post.user.username}
          </Link>
          <p className="text-gray-500 text-sm">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <p className="text-gray-800 mb-4">{post.text}</p>
      {post.media && post.media.length > 0 && (
        <div className="mb-4">
          {post.media.map((media, index) =>
            media.type === "image" ? (
              <img
                key={index}
                src={media.url}
                alt="Post content"
                className="rounded-lg max-h-96 w-full object-cover mb-2"
              />
            ) : media.type === "video" ? (
              <video
                key={index}
                src={media.url}
                controls
                className="rounded-lg max-h-96 w-full object-cover mb-2"
              />
            ) : (
              <audio
                key={index}
                src={media.url}
                controls
                className="w-full mb-2"
              />
            )
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLikeClick}
            className={`flex items-center space-x-1 ${
              post.likes && post.likes.includes(user._id)
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            <HeartIcon className="w-5 h-5" />
            <span>{post.likes ? post.likes.length : 0}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500">
            <ChatIcon className="w-5 h-5" />
            <span>{post.comments ? post.comments.length : 0}</span>
          </button>
          <button
            onClick={() => onBookmark(post._id)}
            className={`flex items-center space-x-1 ${
              isPostBookmarked
                ? isPostBookmarked(post._id)
                  ? "text-blue-500"
                  : "text-gray-500"
                : "text-gray-500"
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
        {post.comments &&
          post.comments.length > 0 &&
          post.comments.map((comment) => (
            <div key={comment._id}>
              <div className="flex items-start space-x-2">
                <Link to={`/profile/${comment.user.username}`}>
                  <img
                    src={comment.user.profilePicture || "/default-avatar.png"}
                    alt={comment.user.username}
                    className="w-8 h-8 rounded-full"
                  />
                </Link>
                <div className="flex-1 bg-gray-50 rounded-lg p-2">
                  <Link
                    to={`/profile/${comment.user.username}`}
                    className="font-semibold text-sm text-gray-900 hover:underline"
                  >
                    {comment.user.username}
                  </Link>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                  <button
                    onClick={() =>
                      setReplyingTo(
                        replyingTo === comment._id ? null : comment._id
                      )
                    }
                    className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                  >
                    {replyingTo === comment._id ? "Cancel" : "Reply"}
                  </button>
                </div>
              </div>

              {/* Display replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-6 mt-2 space-y-2">
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="flex items-start space-x-2">
                      <Link to={`/profile/${reply.user.username}`}>
                        <img
                          src={
                            reply.user.profilePicture || "/default-avatar.png"
                          }
                          alt={reply.user.username}
                          className="w-6 h-6 rounded-full"
                        />
                      </Link>
                      <div className="flex-1 bg-gray-100 rounded-lg p-2">
                        <Link
                          to={`/profile/${reply.user.username}`}
                          className="font-semibold text-xs text-gray-900 hover:underline"
                        >
                          {reply.user.username}
                        </Link>
                        <p className="text-xs text-gray-700">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply form */}
              {replyingTo === comment._id && (
                <form
                  onSubmit={(e) => handleSubmitReply(e, comment._id)}
                  className="ml-6 mt-2"
                >
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Add a reply..."
                      className="flex-1 px-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Reply
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Post;
