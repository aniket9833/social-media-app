import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HeartIcon,
  ChatIcon,
  BookmarkIcon,
  DotsHorizontalIcon,
} from "@heroicons/react/outline";
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
  onEditPost,
  onDeletePost,
}) => {
  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const { user } = useAuth();

  const isSameId = (a, b) => {
    if (a == null || b == null) return false;
    const aId = typeof a === "object" ? a._id : a;
    const bId = typeof b === "object" ? b._id : b;
    if (aId == null || bId == null) return false;
    return aId.toString() === bId.toString();
  };

  const isLikedByMe =
    Array.isArray(post.likes) &&
    !!user?._id &&
    post.likes.some((like) => {
      const likeId =
        (like && typeof like === "object" ? like._id : like) ?? null;
      return likeId != null && likeId.toString() === user._id.toString();
    });

  const handleLikeClick = () => {
    if (!user?._id) return;
    if (isLikedByMe) {
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

  const handleSaveEdit = async () => {
    if (!editText.trim()) {
      toast.error("Post cannot be empty");
      return;
    }

    try {
      await onEditPost(post._id, editText);
      setIsEditing(false);
      setShowMenu(false);
    } catch {
      // Error toast is already shown in the hook
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await api.posts.deleteComment(commentId);
      // Refresh the post by calling onComment callback or similar
      // Since we don't have a direct callback, we can emit a custom event or use a state update
      window.location.reload(); // Temporary solution - can be improved with better state management
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleConfirmDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await onDeletePost(post._id);
      setShowMenu(false);
    } catch {
      // Error toast is already shown in the hook
    }
  };

  const canDeleteComment = (comment) => {
    // Post owner or comment author can delete
    return (
      isSameId(user?._id, post?.user?._id) ||
      isSameId(user?._id, comment?.user?._id)
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Link to={`/profile/${post.user.username}`}>
            <img
              src={
                post.user.profilePicture ||
                "https://img.icons8.com/ios-filled/50/737373/user-male-circle.png"
              }
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

        {/* Ellipsis Menu - Only show for post owner */}
        {isSameId(user?._id, post?.user?._id) && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-500 hover:text-gray-700 p-1"
              title="Post options"
            >
              <DotsHorizontalIcon className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => setIsEditing(true)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 border-t border-gray-300"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Mode */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditText(post.text);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 mb-4">{post.text}</p>
      )}

      {post.media && post.media.length > 0 && (
        <div className="mb-4">
          {post.media.map((media, index) =>
            media.type === "image" ? (
              <img
                key={index}
                src={media.url}
                alt="Post content"
                className="rounded-lg max-h-96 w-full object-contain mb-2"
              />
            ) : media.type === "video" ? (
              <video
                key={index}
                src={media.url}
                controls
                className="rounded-lg max-h-96 w-full object-contain mb-2"
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
              isLikedByMe ? "text-red-500" : "text-gray-500"
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
                    src={
                      comment.user.profilePicture ||
                      "https://img.icons8.com/ios-filled/50/737373/user-male-circle.png"
                    }
                    alt={comment.user.username}
                    className="w-8 h-8 rounded-full"
                  />
                </Link>
                <div className="flex-1 bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/profile/${comment.user.username}`}
                      className="font-semibold text-sm text-gray-900 hover:underline"
                    >
                      {comment.user.username}
                    </Link>
                    {canDeleteComment(comment) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-600 hover:text-red-700 text-xs font-medium"
                        title="Delete comment"
                      >
                        ✕
                      </button>
                    )}
                  </div>
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
                            reply.user.profilePicture ||
                            "https://img.icons8.com/ios-filled/50/737373/user-male-circle.png"
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
