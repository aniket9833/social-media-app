// Compress and process media files (images and videos)
export const compressMedia = async (file) => {
  if (!file) return null;

  const isVideo = file.type.startsWith("video");
  const isImage = file.type.startsWith("image");

  if (isVideo) {
    return await compressVideo(file);
  } else if (isImage) {
    return await compressImage(file);
  }

  return file; // Return original if not image or video
};

// Compress image to reduce file size while keeping original aspect ratio
const compressImage = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const originalWidth = img.width;
        const originalHeight = img.height;

        // Scale down only if too large, maintaining aspect ratio
        const maxWidth = 1080;
        const maxHeight = 1440;

        let finalWidth = originalWidth;
        let finalHeight = originalHeight;

        if (originalWidth > maxWidth || originalHeight > maxHeight) {
          const scale = Math.min(
            maxWidth / originalWidth,
            maxHeight / originalHeight
          );
          finalWidth = Math.round(originalWidth * scale);
          finalHeight = Math.round(originalHeight * scale);
        }

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        const ctx = canvas.getContext("2d");
        // Draw the image onto canvas at destination size without cropping
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.8 // 80% quality
        );
      };
    };
  });
};

// Process video - create preview and compress metadata
const compressVideo = async (file) => {
  // For videos, we'll just validate and return the file
  // Real video compression would require ffmpeg or similar server-side
  // For now, we'll just ensure it's under reasonable size
  const maxSize = 100 * 1024 * 1024; // 100MB

  if (file.size > maxSize) {
    throw new Error("Video file is too large (max 100MB)");
  }

  return file;
};

// Generate preview from media file
export const generateMediaPreview = async (file) => {
  if (!file) return null;

  return new Promise((resolve) => {
    if (file.type.startsWith("image")) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        resolve({
          type: "image",
          src: e.target.result,
          name: file.name,
        });
      };
    } else if (file.type.startsWith("video")) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        resolve({
          type: "video",
          src: e.target.result,
          name: file.name,
        });
      };
    } else if (file.type.startsWith("audio")) {
      resolve({
        type: "audio",
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2),
      });
    } else {
      resolve({
        type: "file",
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2),
      });
    }
  });
};
