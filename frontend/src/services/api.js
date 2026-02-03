import axios from "axios";

const API_BASE_URL = "https://laughableai.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Auth Services
export const authService = {
  register: async (userData) => {
    try {
      const response = await api.post("/api/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post("/api/auth/login", credentials);
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  getToken: () => {
    return localStorage.getItem("token");
  },
};

// Chat Services
export const chatService = {
  createChat: async (chatData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/api/chat", chatData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  sendMessage: async (chatId, message) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        `/api/chat/${chatId}/message`,
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      // Preserve status code in error for better handling
      const err = new Error(error.response?.data?.message || error.message);
      err.response = error.response;
      throw err;
    }
  },

  getChats: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/chat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default api;
