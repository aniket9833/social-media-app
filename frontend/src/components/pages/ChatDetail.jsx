import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  compressMedia,
  generateMediaPreview,
} from "../../utils/mediaCompression";

const ChatDetail = () => {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [compressing, setCompressing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await api.chats.getById(chatId);
        setChat(response.data.chat);
        setMessages(response.data.messages || []);
      } catch {
        toast.error("Failed to fetch chat");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();

    // Poll for new messages every 2 seconds
    const interval = setInterval(fetchChat, 2000);
    return () => clearInterval(interval);
  }, [chatId]);

  const handleMediaSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressing(true);
      const compressed = await compressMedia(file);
      setMediaFile(compressed);

      const preview = await generateMediaPreview(compressed);
      setMediaPreview(preview);
      toast.success("Media compressed and ready!");
    } catch (error) {
      toast.error(error.message || "Failed to process media");
    } finally {
      setCompressing(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() && !mediaFile) {
      toast.error("Please enter a message or select a file");
      return;
    }

    try {
      const formData = new FormData();
      if (messageText.trim()) {
        formData.append("text", messageText);
      }
      if (mediaFile) {
        formData.append("media", mediaFile);
      }

      const response = await api.chats.sendMessage(chatId, formData);
      setMessages([...messages, response.data]);
      setMessageText("");
      setMediaFile(null);
      setMediaPreview(null);
      toast.success("Message sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const otherUser = chat?.participants.find((p) => p._id !== user._id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md flex flex-col h-screen max-h-[calc(100vh-120px)]">
        {/* Chat Header */}
        <div className="border-b p-4 flex items-center space-x-3">
          <img
            src={otherUser?.profilePicture || "/default-avatar.png"}
            alt={otherUser?.username}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="font-semibold text-lg">{otherUser?.fullName}</p>
            <p className="text-sm text-gray-600">@{otherUser?.username}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.sender._id === user._id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender._id === user._id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {message.text && <p>{message.text}</p>}
                  {message.media && (
                    <div>
                      {message.media.type === "image" && (
                        <img
                          src={message.media.url}
                          alt="Media"
                          className="max-w-xs rounded"
                        />
                      )}
                      {message.media.type === "video" && (
                        <video
                          src={message.media.url}
                          controls
                          className="max-w-xs rounded"
                        />
                      )}
                      {message.media.type === "audio" && (
                        <audio
                          src={message.media.url}
                          controls
                          className="mt-2"
                        />
                      )}
                    </div>
                  )}
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="border-t p-4 space-y-2">
          {/* Media Preview */}
          {mediaPreview && (
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              {mediaPreview.type === "image" && (
                <img
                  src={mediaPreview.src}
                  alt="Preview"
                  className="max-h-48 w-full object-cover"
                />
              )}
              {mediaPreview.type === "video" && (
                <video
                  src={mediaPreview.src}
                  controls
                  className="max-h-48 w-full"
                />
              )}
              {mediaPreview.type === "audio" && (
                <div className="flex items-center space-x-3 p-3">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm10 12H4V5h10v10z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {mediaPreview.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {mediaPreview.size} MB
                    </p>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setMediaFile(null);
                  setMediaPreview(null);
                }}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex space-x-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={compressing}
            />
            <label
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
              title="Attach media (image, video, audio)"
            >
              📎
              <input
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleMediaSelect}
                disabled={compressing}
                className="hidden"
              />
            </label>
            <button
              type="submit"
              disabled={compressing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {compressing ? "..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatDetail;
