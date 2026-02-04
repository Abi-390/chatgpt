import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { chatService, authService } from "../services/api";
import { ThemeContext } from "../context/ThemeContext";

export default function Chat() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createNewChat = async (userMessage) => {
    try {
      console.log("📝 Creating new chat with message:", userMessage);
      // Create chat with title based on first message
      const response = await chatService.createChat({
        title: userMessage.substring(0, 50) || "New Chat",
      });
      const chatId = response.chat?._id || response._id;
      console.log("✅ Chat created with ID:", chatId);
      return chatId;
    } catch (error) {
      console.error("❌ Error creating chat:", error);
      return null;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input;
    setInput("");
    setLoading(true);

    try {
      let chatId = currentChatId;

      // Create chat if not already started
      if (!chatStarted) {
        console.log("🚀 Starting new chat...");
        chatId = await createNewChat(messageText);
        if (!chatId) {
          throw new Error("Failed to create chat");
        }
        setCurrentChatId(chatId);
        setChatStarted(true);
      }

      // Send message to backend
      console.log("📤 Sending message to backend...");
      const response = await chatService.sendMessage(chatId, messageText);
      console.log("✅ Response from backend:", response);

      // Display AI response
      const aiMessage = {
        id: Date.now() + 1,
        text:
          response?.reply ||
          response?.message ||
          response?.response ||
          "Sorry, I couldn't process your request.",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error sending message:", error);

      // Handle rate limit errors specially
      let errorText =
        "Error: " + (error?.message || "Could not get AI response");

      // Check if it's a rate limit error (429)
      if (error?.response?.status === 429) {
        errorText =
          "⏱️ Rate limit hit! I'm getting too many requests. Please wait a moment and try again. The free Google API tier is being... free with me. 😅";
      } else if (error?.response?.status === 401) {
        errorText =
          "🔐 Oops! Authentication failed. You might need to log in again.";
      } else if (error?.response?.status === 500) {
        errorText =
          "😬 Backend error! The Render free tier might be sleeping. Give it a moment and try again!";
      }

      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatStarted(false);
    setInput("");
    setCurrentChatId(null);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Overlay Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Modal on mobile, fixed on tablet/desktop */}
      <div
        className={`${
          sidebarOpen ? "fixed md:relative" : "hidden"
        } md:flex w-64 h-screen md:h-full flex-col bg-gray-900 text-white transition-all duration-300 z-40`}
      >
        {/* Close Button for Mobile */}
        <div className="md:hidden p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-xl font-bold">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 border-b border-gray-700 hidden md:block">
          <h2 className="text-2xl font-bold text-yellow-400">
            😂 Laughable AI
          </h2>
          <p className="text-sm text-gray-400 mt-1">Your Funny AI Friend</p>
        </div>

        <button
          onClick={handleNewChat}
          className="m-4 p-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-semibold transition duration-200 flex items-center justify-center gap-2 text-gray-900"
        >
          <span>🤣</span> Start Roasting
        </button>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Chat history will be displayed here */}
          <div className="text-gray-400 text-sm">
            {messages.length === 0
              ? "No chats yet"
              : `${messages.length} messages`}
          </div>
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col ${isDark ? "bg-gray-900" : "bg-white"}`}
      >
        {/* Header with Mobile Menu Toggle */}
        <div
          className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-4 md:px-8 py-4 shadow-sm flex justify-between items-center`}
        >
          <div className="flex-1">
            <h1
              className={`text-lg md:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {chatStarted ? "Roasting AI Chat" : "Welcome to Laughable AI"}
            </h1>
            <p
              className={`text-xs md:text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {chatStarted
                ? "Ask me anything and get a hilarious roast! 🤣"
                : "Start a conversation with the funniest AI on the block"}
            </p>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`mx-2 p-2 rounded-lg transition duration-200 ${isDark ? "bg-gray-700 hover:bg-gray-600 text-yellow-400" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a1 1 0 00-1.414 0l-.707.707a1 1 0 001.414 1.414l.707-.707.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`md:hidden ml-2 p-2 rounded-lg ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div
          className={`flex-1 overflow-y-auto p-4 md:p-8 space-y-4 ${isDark ? "bg-gray-900" : "bg-white"}`}
        >
          {messages.length === 0 && !chatStarted && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center px-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-blue-900" : "bg-blue-100"}`}
                >
                  <span className="text-3xl">💬</span>
                </div>
                <h2
                  className={`text-xl md:text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Start Your Chat
                </h2>
                <p
                  className={`text-sm md:text-base ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Type your message below to begin conversing with the AI
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} px-2 md:px-0`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-3 rounded-lg text-sm md:text-base ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : isDark
                      ? "bg-gray-800 text-white rounded-bl-none"
                      : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                <p className="break-words">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start px-2 md:px-0">
              <div
                className={`${isDark ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-900"} px-4 py-3 rounded-lg rounded-bl-none`}
              >
                <div className="flex space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full animate-bounce ${isDark ? "bg-gray-400" : "bg-gray-500"}`}
                  ></div>
                  <div
                    className={`w-2 h-2 rounded-full animate-bounce delay-100 ${isDark ? "bg-gray-400" : "bg-gray-500"}`}
                  ></div>
                  <div
                    className={`w-2 h-2 rounded-full animate-bounce delay-200 ${isDark ? "bg-gray-400" : "bg-gray-500"}`}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-t p-3 md:p-4`}
        >
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex gap-2 md:gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className={`flex-1 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900"}`}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-3 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition duration-200 text-sm md:text-base"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
