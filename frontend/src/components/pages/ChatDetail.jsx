import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const ChatDetail = () => {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [loading, setLoading] = useState(true);
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
          {mediaFile && (
            <div className="text-sm text-gray-600 flex items-center justify-between">
              <span>📎 {mediaFile.name}</span>
              <button
                type="button"
                onClick={() => setMediaFile(null)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
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
            />
            <label
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
              title="Attach media (image, video, audio)"
            >
              📎
              <input
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={(e) => setMediaFile(e.target.files?.[0])}
                className="hidden"
              />
            </label>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatDetail;
