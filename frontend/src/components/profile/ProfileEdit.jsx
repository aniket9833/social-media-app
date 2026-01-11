import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  compressMedia,
  generateMediaPreview,
} from "../../utils/mediaCompression";

const ProfileEdit = ({ profile, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    fullName: profile.fullName || "",
    bio: profile.bio || "",
    profilePicture: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const { user } = useAuth();

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressing(true);
      const compressed = await compressMedia(file);
      setFormData({ ...formData, profilePicture: compressed });

      const preview = await generateMediaPreview(compressed);
      setImagePreview(preview);
      toast.success("Image compressed and ready!");
    } catch (error) {
      toast.error(error.message || "Failed to process image");
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("bio", formData.bio);
    if (formData.profilePicture) {
      data.append("profilePicture", formData.profilePicture);
    }

    try {
      // Use the users API with put request to /profile endpoint
      const response = await fetch(
        `http://localhost:3000/api/v1/users/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          body: data,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            {/* Profile Picture Preview */}
            {imagePreview && (
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imagePreview.src}
                  alt="Preview"
                  className="w-full h-40 object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, profilePicture: null });
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
            )}

            <div>
              <label className="block text-gray-700 mb-2">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={compressing}
                className="w-full"
              />
              {compressing && (
                <p className="text-sm text-blue-600 font-medium mt-2">
                  Compressing image...
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || compressing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;
