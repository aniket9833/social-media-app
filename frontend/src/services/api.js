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
    update: (postId, postData) =>
      axios.put(`${API_PREFIX}/posts/${postId}`, postData),
    delete: (postId) => axios.delete(`${API_PREFIX}/posts/${postId}`),
    like: (postId) => axios.put(`${API_PREFIX}/posts/${postId}/like`),
    unlike: (postId) => axios.put(`${API_PREFIX}/posts/${postId}/unlike`),
    comment: (postId, text) =>
      axios.post(`${API_PREFIX}/posts/${postId}/comments`, { text }),
    reply: (commentId, text) =>
      axios.post(`${API_PREFIX}/posts/comments/${commentId}/reply`, { text }),
    deleteReply: (commentId, replyId) =>
      axios.delete(
        `${API_PREFIX}/posts/comments/${commentId}/reply/${replyId}`
      ),
    bookmark: (postId) => axios.put(`${API_PREFIX}/posts/${postId}/bookmark`),
    unbookmark: (postId) =>
      axios.put(`${API_PREFIX}/posts/${postId}/unbookmark`),
  },

  users: {
    getProfile: (username) => axios.get(`${API_PREFIX}/users/${username}`),
    search: (query) =>
      axios.get(`${API_PREFIX}/users/search`, { params: { query } }),
    update: (userId, userData) =>
      axios.put(`${API_PREFIX}/users/${userId}`, userData),
    follow: (userId) => axios.put(`${API_PREFIX}/users/${userId}/follow`),
    unfollow: (userId) => axios.put(`${API_PREFIX}/users/${userId}/unfollow`),
  },
};

export default api;
