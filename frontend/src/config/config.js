const config = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  AUTH_TOKEN_KEY: import.meta.env.VITE_AUTH_TOKEN_KEY || "user_auth",
  DEFAULT_AVATAR:
    import.meta.env.VITE_DEFAULT_AVATAR ||
    "https://img.icons8.com/ios-filled/50/737373/user-male-circle.png",
  ENV: import.meta.env.MODE || "development",
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || "30000", 10),
};

// Validate required configuration
const validateConfig = () => {
  const requiredFields = ["API_BASE_URL", "AUTH_TOKEN_KEY"];
  const missingFields = requiredFields.filter((field) => !config[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required configuration: ${missingFields.join(", ")}`
    );
  }
};

// Run validation in non-production environments
if (config.ENV !== "production") {
  validateConfig();
}

export default config;
