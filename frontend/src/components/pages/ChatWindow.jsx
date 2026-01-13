import { useState, useEffect, useRef } from "react";
import { PaperClipIcon } from "@heroicons/react/outline";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  compressMedia,
  generateMediaPreview,
} from "../../utils/mediaCompression";

const ChatWindow = ({ chat, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isUserScrollingRef = useRef(false);
  const prevMessagesLengthRef = useRef(0);

  const otherUser = chat?.participants?.find(
    (p) => p?._id !== currentUser?._id
  );

  // Auto-scroll to bottom only when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Detect if user is manually scrolling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      isUserScrollingRef.current = !isAtBottom;
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Only auto-scroll when new messages arrive or when user is at bottom
  useEffect(() => {
    const hasNewMessages = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;

    if (hasNewMessages && !isUserScrollingRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  // Fetch and poll for messages
  useEffect(() => {
    if (!chat?._id) return;

    const fetchMessages = async () => {
      try {
        const { data } = await api.chats.getById(chat._id);
        setMessages(data.messages || []);
      } catch (err) {
        console.warn("Failed to fetch messages", err);
        toast.error("Failed to load messages");
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [chat?._id]);

  const handleMediaSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressing(true);
      const compressed = await compressMedia(file);
      setMediaFile(compressed);

      const preview = await generateMediaPreview(compressed);
      setMediaPreview(preview);
      toast.success("Media ready to send");
    } catch (err) {
      toast.error("Failed to process media");
      console.error(err);
    } finally {
      setCompressing(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && !mediaFile) return;
    if (!chat?._id) return;

    setSending(true);

    try {
      const formData = new FormData();
      if (messageText.trim()) formData.append("text", messageText);
      if (mediaFile) formData.append("media", mediaFile);

      const { data: newMessage } = await api.chats.sendMessage(
        chat._id,
        formData
      );

      setMessages((prev) => [...prev, newMessage]);
      setMessageText("");
      setMediaFile(null);
      setMediaPreview(null);
      toast.success("Message sent");
    } catch (err) {
      toast.error("Failed to send message");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-white p-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <img
          src={otherUser?.profilePicture || "/default-avatar.png"}
          alt=""
          className="w-10 h-10 rounded-full object-cover border"
          onError={(e) => (e.target.src = "/default-avatar.png")}
        />
        <div>
          <p className="font-semibold text-lg">
            {otherUser?.fullName || "Deleted User"}
          </p>
          <p className="text-sm text-gray-500">
            @{otherUser?.username || "unknown"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50"
      >
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === currentUser?._id;

            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl break-words ${
                    isMe
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900 shadow-sm"
                  }`}
                >
                  {msg.text && <p>{msg.text}</p>}

                  {msg.media && (
                    <div className="mt-1.5">
                      {msg.media.type?.startsWith("image") && (
                        <img
                          src={msg.media.url}
                          alt="Shared image"
                          className="max-w-full rounded-lg"
                        />
                      )}
                      {msg.media.type?.startsWith("video") && (
                        <video
                          src={msg.media.url}
                          controls
                          className="max-w-full rounded-lg"
                        />
                      )}
                      {msg.media.type?.startsWith("audio") && (
                        <audio
                          src={msg.media.url}
                          controls
                          className="mt-2 w-full"
                        />
                      )}
                    </div>
                  )}

                  <p className="text-xs mt-1 opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="border-t bg-white p-4 flex flex-col gap-3 sticky bottom-0 z-10"
      >
        {/* Media Preview */}
        {mediaPreview && (
          <div className="relative bg-gray-100 rounded-xl overflow-hidden max-h-48">
            {mediaPreview.type === "image" && (
              <img
                src={mediaPreview.src}
                alt="preview"
                className="max-h-48 w-full object-contain"
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
                    {mediaPreview.name || "Audio file"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {mediaPreview.size ? `${mediaPreview.size} MB` : ""}
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
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-md hover:bg-red-700"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            disabled={sending || compressing}
            className="flex-1 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
          />

          <label className="px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 cursor-pointer flex items-center transition disabled:opacity-50">
            <PaperClipIcon className="w-6 h-6 text-gray-600" />
            <input
              type="file"
              accept="image/*,video/*,audio/*"
              className="hidden"
              onChange={handleMediaSelect}
              disabled={compressing || sending}
            />
          </label>

          <button
            type="submit"
            disabled={
              sending || compressing || (!messageText.trim() && !mediaFile)
            }
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition font-medium"
          >
            {sending ? "Sending..." : compressing ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
