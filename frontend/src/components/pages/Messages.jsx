import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ChatIcon } from "@heroicons/react/outline";

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await api.chats.getAll();
        setChats(response.data || []);
      } catch {
        toast.error("Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleChatClick = (chatId) => {
    setSelectedChat(chatId);
    navigate(`/messages/${chatId}`);
  };

  const getOtherParticipant = (chat) => {
    return chat.participants.find((p) => p._id !== user._id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <ChatIcon className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold">Messages</h2>
        </div>
      </div>

      {chats.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <ChatIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No messages yet</p>
          <p className="text-gray-400 mt-2">
            Start a conversation by visiting a user's profile
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chat List */}
          <div className="md:col-span-1 bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-bold mb-4">Conversations</h3>
            <div className="space-y-2">
              {chats.map((chat) => {
                const otherUser = getOtherParticipant(chat);
                return (
                  <button
                    key={chat._id}
                    onClick={() => handleChatClick(chat._id)}
                    className={`w-full text-left p-3 rounded-lg hover:bg-gray-100 transition ${
                      selectedChat === chat._id ? "bg-blue-100" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={otherUser?.profilePicture || "/default-avatar.png"}
                        alt={otherUser?.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {otherUser?.fullName}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          @{otherUser?.username}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Window */}
          {selectedChat && (
            <div className="md:col-span-2">
              <ChatWindow chatId={selectedChat} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Chat Window Component
const ChatWindow = ({ chatId }) => {
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
        setChat(response.data);
        setMessages(response.data.messages || []);
      } catch {
        toast.error("Failed to fetch chat");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
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
    } catch {
      toast.error("Failed to send message");
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
    <div className="bg-white rounded-lg shadow-md flex flex-col h-96">
      {/* Chat Header */}
      <div className="border-b p-4 flex items-center space-x-3">
        <img
          src={otherUser?.profilePicture || "/default-avatar.png"}
          alt={otherUser?.username}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold">{otherUser?.fullName}</p>
          <p className="text-sm text-gray-600">@{otherUser?.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet</p>
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
                      <audio src={message.media.url} controls />
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
          <div className="text-sm text-gray-600">
            📎 {mediaFile.name}
            <button
              type="button"
              onClick={() => setMediaFile(null)}
              className="ml-2 text-red-600 hover:text-red-700"
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
          <label className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer">
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
  );
};

export default Messages;
