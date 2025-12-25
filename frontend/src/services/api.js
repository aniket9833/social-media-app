import axios from "./axios";

const API_PREFIX = "/api/v1";

const api = {
  auth: {
    login: (credentials) => axios.post(`${API_PREFIX}/auth/login`, credentials),
    register: (userData) => {
      // Ensure userData has all required fields
      const requiredData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
      };
      return axios.post(`${API_PREFIX}/auth/register`, requiredData);
    },
  },

  posts: {
    getFeed: () => axios.get(`${API_PREFIX}/posts/feed`),
    getExplore: (sortBy) =>
      axios.get(`${API_PREFIX}/posts/explore?sort=${sortBy}`),
    create: (postData) => axios.post(`${API_PREFIX}/posts`, postData),
    like: (postId) => axios.post(`${API_PREFIX}/posts/${postId}/like`),
    comment: (postId, content) =>
      axios.post(`${API_PREFIX}/posts/${postId}/comments`, { content }),
    bookmark: (postId) => axios.post(`${API_PREFIX}/posts/${postId}/bookmark`),
  },

  users: {
    getProfile: (username) => axios.get(`${API_PREFIX}/users/${username}`),
    update: (userId, userData) =>
      axios.put(`${API_PREFIX}/users/${userId}`, userData),
    follow: (userId) => axios.put(`${API_PREFIX}/users/${userId}/follow`),
  },
};

export default api;
