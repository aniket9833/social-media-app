import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  compressMedia,
  generateMediaPreview,
} from "../../utils/mediaCompression";

const PostForm = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const { user } = useAuth();

  const handleMediaSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setCompressing(true);
      const compressed = await compressMedia(file);
      setMedia(compressed);

      const preview = await generateMediaPreview(compressed);
      setMediaPreview(preview);
      toast.success("Media compressed and ready!");
    } catch (error) {
      toast.error(error.message || "Failed to process media");
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("text", content);
    if (media) {
      formData.append("media", media);
    }

    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const response = await fetch(`${apiBaseUrl}/api/v1/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      setContent("");
      setMedia(null);
      setMediaPreview(null);
      toast.success("Post created successfully!");
      if (onPostCreated) onPostCreated();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="3"
          />
        </div>

        {/* Media Preview */}
        {mediaPreview && (
          <div className="mb-4 relative">
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              {mediaPreview.type === "image" && (
                <img
                  src={mediaPreview.src}
                  alt="Preview"
                  className="max-h-80 w-full object-cover"
                />
              )}
              {mediaPreview.type === "video" && (
                <video
                  src={mediaPreview.src}
                  controls
                  className="max-h-80 w-full"
                />
              )}
              {mediaPreview.type === "audio" && (
                <div className="flex items-center space-x-3 p-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm10 12H4V5h10v10z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-700">
                      {mediaPreview.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {mediaPreview.size} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setMedia(null);
                setMediaPreview(null);
              }}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label className="cursor-pointer">
              <span className="flex items-center text-gray-500 hover:text-blue-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*,audio/*"
                onChange={handleMediaSelect}
                disabled={compressing}
              />
            </label>
            {compressing && (
              <span className="text-sm text-blue-600 font-medium">
                Compressing...
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim() || compressing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition duration-200"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
