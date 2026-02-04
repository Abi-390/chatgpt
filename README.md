# 😂 Laughable AI - The Funniest AI Chat Application

[![Live Demo](https://img.shields.io/badge/Live%20Demo-laughableai.vercel.app-blue?style=for-the-badge)](https://laughableai.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Abi--390%2Fchatgpt-black?style=for-the-badge&logo=github)](https://github.com/Abi-390/chatgpt)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)]()

> **Laughable AI** is a real-time conversational AI chatbot designed to deliver hilarious, witty, and entertaining responses while maintaining genuine helpfulness. Powered by Google's Gemini API, it combines cutting-edge AI technology with playful humor.

---

## 🚀 Live Demo

**🔗 [Visit Laughable AI](https://laughableai.vercel.app)**

- **Frontend**: Hosted on [Vercel](https://laughableai.vercel.app)
- **Backend**: Running on [Render](https://laughableai.onrender.com)
- **Database**: MongoDB Atlas

---

## ✨ Key Features

### 🤖 AI-Powered Conversations
- **Google Gemini 2.0 Flash** - State-of-the-art LLM for intelligent responses
- **Conversation History** - Full context awareness across messages
- **RAG System** - Retrieval-Augmented Generation with vector embeddings (Pinecone)
- **Contextual Humor** - AI adapts humor based on conversation flow

### 🎨 User Experience
- **Dark/Light Mode Toggle** - Full theme support with persistent preferences
- **Real-time Chat** - Instant message delivery and AI responses
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Message Timestamps** - Track conversation flow and timing
- **Loading Indicators** - Visual feedback during API calls

### 🔐 Security & Authentication
- **JWT Authentication** - Secure token-based session management
- **Password Hashing** - bcryptjs encryption (10 salt rounds)
- **Protected Routes** - Client-side route protection
- **CORS Support** - Secure cross-origin requests

### 📊 Rate Limiting & Performance
- **API Deduplication** - Prevents duplicate simultaneous requests
- **Request Validation** - Input sanitization and error handling
- **Optimized Calls** - Single API call per user message (no wasted quota)
- **Cold Start Mitigation** - User-friendly backend startup messaging

### 💾 Data Management
- **MongoDB** - Persistent message storage
- **Vector Database (Pinecone)** - Semantic search and memory retention
- **Chat History** - Full conversation preservation
- **User Profiles** - Email-based user management

---

## 🏗️ Project Structure

```
CHATGPT PROJECT/
│
├── frontend/                          # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx    # Route protection wrapper
│   │   ├── context/
│   │   │   └── ThemeContext.jsx      # Dark/Light theme management
│   │   ├── pages/
│   │   │   ├── Chat.jsx              # Main chat interface
│   │   │   ├── Home.jsx              # Landing page
│   │   │   ├── Login.jsx             # User login
│   │   │   └── Register.jsx          # User registration
│   │   ├── services/
│   │   │   └── api.js                # Axios API client
│   │   ├── App.jsx                   # Root component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── vercel.json                   # Vercel deployment config
│
├── backend/                           # Node.js + Express Backend
│   ├── src/
│   │   ├── app.js                    # Express app setup
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Auth logic (register, login)
│   │   │   └── chat.controller.js    # Chat & AI logic
│   │   ├── db/
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js    # JWT verification
│   │   ├── models/
│   │   │   ├── user.model.js         # User schema
│   │   │   ├── chat.model.js         # Chat schema
│   │   │   └── message.model.js      # Message schema
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # Auth endpoints
│   │   │   └── chat.routes.js        # Chat endpoints
│   │   ├── services/
│   │   │   ├── ai.service.js         # Google Gemini AI service
│   │   │   └── vector.service.js     # Pinecone vector DB service
│   │   └── sockets/
│   │       └── socket.server.js      # Socket.IO handlers
│   ├── server.js                     # Server entry point
│   ├── package.json
│   └── .env                          # Environment variables
│
├── README.md                          # This file
├── DARK_LIGHT_THEME.md               # Theme implementation docs
├── API_RATE_LIMIT_ROOT_CAUSE.md      # Rate limit fixes documentation
└── RATE_LIMIT_FIX.md                 # Previous rate limit solutions

```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI framework | 18.x |
| **Vite** | Build tool & dev server | Latest |
| **Tailwind CSS** | Styling | 3.x |
| **Axios** | HTTP client | ^1.x |
| **React Router** | Navigation | ^6.x |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime | 18+ |
| **Express** | Web framework | ^5.x |
| **MongoDB** | Database | Cloud |
| **Mongoose** | ODM | ^9.x |
| **JWT** | Authentication | ^9.x |
| **bcryptjs** | Password hashing | ^3.x |
| **Socket.IO** | Real-time communication | ^4.x |

### AI & External Services
| Service | Purpose |
|---------|---------|
| **Google Gemini 2.0 Flash** | LLM for AI responses |
| **Pinecone** | Vector database for RAG |
| **MongoDB Atlas** | Cloud database |

### Deployment
| Platform | Purpose |
|----------|---------|
| **Vercel** | Frontend hosting |
| **Render** | Backend hosting |
| **GitHub** | Version control |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB URI
- Google Gemini API Key
- Pinecone API Key

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_api_key
PINECONE_API_KEY=your_pinecone_key
EOF

# Start server (localhost:3000)
npm start
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
```

### Chat
```
POST   /api/chat             - Create new chat
POST   /api/chat/:chatId/message  - Send message & get AI response
GET    /api/chat             - Get all user chats
GET    /api/chat/:chatId     - Get chat with messages
```

---

## 🎯 Core Features Implementation

### ✅ Dark/Light Theme
- Context API for global theme state
- localStorage persistence
- Respects system preferences
- Toggle button in header

### ✅ RAG (Retrieval-Augmented Generation)
- Conversation history passed to AI
- Vector embeddings via Pinecone
- Semantic search for relevant context
- Message persistence in MongoDB

### ✅ Rate Limit Optimization
- Single API call per message (no duplicate requests)
- Request deduplication per chat
- Graceful 429 error handling
- User-friendly error messages

### ✅ Authentication Flow
1. User registers with first name, last name, email, password
2. Password hashed with bcryptjs (10 rounds)
3. JWT token issued on login/register
4. Token stored in localStorage
5. Protected routes verify token validity

### ✅ Real-time Chat
- Create new chats dynamically
- Send messages with full context awareness
- AI responses based on conversation history
- Message timestamps and role tracking

---

## 🔧 Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-key
GEMINI_API_KEY=AIza...
PINECONE_API_KEY=pcsk_...
NODE_ENV=production
```

### Frontend (.env)
```
VITE_API_URL=https://laughableai.onrender.com
```

---

## 📊 Database Schemas

### User Model
```javascript
{
  email: String (unique, required),
  fullName: {
    firstName: String (required),
    lastName: String (required)
  },
  password: String (hashed)
}
```

### Chat Model
```javascript
{
  user: ObjectId (reference to User),
  title: String,
  createdAt: Date,
  lastActivity: Date
}
```

### Message Model
```javascript
{
  chat: ObjectId (reference to Chat),
  user: ObjectId (reference to User),
  content: String,
  role: String ('user' or 'model'),
  createdAt: Date
}
```

---

## 🐛 Bug Fixes & Optimizations

### Rate Limit Issue (Fixed)
**Problem**: Getting 429 errors immediately
- Root cause: 3 API calls per message (AI response + 2 vector calls)
- Missing API key in GoogleGenAI initialization

**Solution**:
- Disabled duplicate vector generation calls
- Added API key to GoogleGenAI: `apiKey: process.env.GEMINI_API_KEY`
- Kept RAG functional via conversation history
- Result: 1 API call per message (3x reduction)

### Request Deduplication
- In-flight request tracking per chat
- Prevents simultaneous duplicate requests
- Returns 429 if request already in progress

### Socket.IO Handler Disabled
- Removed duplicate socket.io "ai-message" handler
- Only REST API endpoint processes messages
- Prevents double API consumption

---

## 🎨 UI/UX Highlights

- **Modern Design**: Clean, intuitive interface with Tailwind CSS
- **Dark Mode**: Full dark/light theme with smooth transitions
- **Responsive**: Mobile-first design for all screen sizes
- **Loading States**: Visual feedback during processing
- **Error Handling**: User-friendly error messages
- **Accessibility**: Keyboard navigation, semantic HTML

---

## 📈 Performance Metrics

- **API Calls**: 1 per message (optimized from 3)
- **Response Time**: ~2-5 seconds (with Gemini latency)
- **Cold Start**: ~30-50 seconds first request (free tier Render)
- **Message Storage**: Instant (MongoDB)
- **Vector Storage**: Optional, disabled by default

---

## 🔐 Security Features

✅ JWT Authentication with httpOnly cookies
✅ Password hashing with bcryptjs (10 salt rounds)
✅ CORS protection
✅ Input validation & sanitization
✅ Rate limiting on API calls
✅ Protected routes with auth middleware
✅ User isolation (users only see their own chats)

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Automatic deployment on push to main
# Environment: Production
# URL: https://laughableai.vercel.app
```

### Backend (Render)
```bash
# Automatic deployment on push to main
# Environment: Production
# URL: https://laughableai.onrender.com
# Note: Free tier has 50-minute cold start
```

---

## 📝 Documentation

- **[Dark/Light Theme Guide](./DARK_LIGHT_THEME.md)** - Theme implementation details
- **[Rate Limit Fixes](./API_RATE_LIMIT_ROOT_CAUSE.md)** - API optimization documentation
- **[Previous Solutions](./RATE_LIMIT_FIX.md)** - Historical rate limit fixes

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📋 Known Limitations

- **Google Gemini Free Tier**: ~15 requests per minute
- **Cold Start**: Render free tier experiences 30-50 second startup
- **Vector Storage**: Currently disabled to conserve API quota
- **Concurrent Users**: Render free tier has resource limitations

---

## 🛣️ Roadmap

- [ ] Implement separate embedding service (Hugging Face)
- [ ] Re-enable full RAG with vectors
- [ ] Chat export (PDF/JSON)
- [ ] Conversation bookmarking
- [ ] Advanced search across chats
- [ ] User preferences (tone, style)
- [ ] Conversation branching
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Collaborative chats

---

## 💡 Future Enhancements

### Short Term
- Real-time typing indicators
- Message editing/deletion
- Chat naming & organization
- User profile customization

### Long Term
- Mobile app (React Native)
- Integration with other AI models
- Conversation analytics
- Advanced caching strategies
- WebSocket optimization

---

## 📞 Support & Contact

For issues, questions, or feedback:
- 🐛 [Report Issues](https://github.com/Abi-390/chatgpt/issues)
- 💬 [Discussions](https://github.com/Abi-390/chatgpt/discussions)
- 📧 Email: contact@laughableai.com

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google Gemini API** - Powering our AI responses
- **Pinecone** - Vector database for RAG
- **MongoDB** - Data persistence
- **Vercel & Render** - Hosting platforms
- **React & Tailwind** - Frontend framework and styling

---

## 📊 Project Stats

- **Created**: February 2026
- **Status**: Active & Maintained
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Deployments**: 2 (Frontend + Backend)

---

<div align="center">

### Made with ❤️ by Abi-390

**[Live Demo](https://laughableai.vercel.app)** • **[GitHub](https://github.com/Abi-390/chatgpt)** • **[Report Bug](https://github.com/Abi-390/chatgpt/issues)**

</div>

---

**Last Updated**: February 4, 2026
