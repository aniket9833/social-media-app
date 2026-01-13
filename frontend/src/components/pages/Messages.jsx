import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { ChatIcon } from "@heroicons/react/outline";
import ChatWindow from "./ChatWindow";

const Messages = () => {
  const { user } = useAuth() ?? { user: null };
  const { chatId: urlChatId } = useParams();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(urlChatId || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    const fetchChats = async () => {
      try {
        const { data } = await api.chats.getAll();
        setChats(data || []);

        // Auto select first chat if no chat in URL
        if (!urlChatId && data?.length > 0 && !selectedChatId) {
          const firstId = data[0]._id;
          setSelectedChatId(firstId);
          navigate(`/messages/${firstId}`, { replace: true });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    // Refresh chat list periodically
    const interval = setInterval(fetchChats, 30000);
    return () => clearInterval(interval);
  }, [user?._id, urlChatId, navigate, selectedChatId]);

  // Update selected chat when URL changes
  useEffect(() => {
    if (urlChatId && urlChatId !== selectedChatId) {
      setSelectedChatId(urlChatId);
    }
  }, [urlChatId]);

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    navigate(`/messages/${chatId}`, { replace: true });
  };

  const getOtherParticipant = (chat) =>
    chat?.participants?.find((p) => p?._id !== user?._id) ?? null;

  const selectedChat = chats.find((c) => c._id === selectedChatId);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Please login to view messages</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-50">
      {/* LEFT PANEL - Chat List */}
      <div className="w-full md:w-96 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <ChatIcon className="w-7 h-7 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : chats.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <ChatIcon className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium">No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {chats.map((chat) => {
                const other = getOtherParticipant(chat);
                const isActive = chat._id === selectedChatId;

                return (
                  <button
                    key={chat._id}
                    onClick={() => handleSelectChat(chat._id)}
                    className={`w-full text-left px-4 py-3 transition-all ${
                      isActive
                        ? "bg-blue-50 border-l-4 border-blue-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          other?.profilePicture ||
                          "https://img.icons8.com/ios-filled/50/737373/user-male-circle.png"
                        }
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border"
                        onError={(e) =>
                          (e.target.src =
                            "https://img.icons8.com/ios-filled/50/737373/user-male-circle.png")
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`truncate ${
                            isActive ? "font-semibold" : "font-medium"
                          }`}
                        >
                          {other?.fullName || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          @{other?.username || "unknown"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - Chat Window */}
      <div className="flex-1 flex flex-col min-h-0">
        {selectedChatId && selectedChat ? (
          <ChatWindow
            key={selectedChatId}
            chat={selectedChat}
            currentUser={user}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <ChatIcon className="w-24 h-24 text-gray-200 mb-6" />
            <h3 className="text-2xl font-medium text-gray-700">
              {loading ? "Loading..." : "Select a conversation"}
            </h3>
            <p className="text-gray-500 mt-2">
              Choose a chat from the left to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
