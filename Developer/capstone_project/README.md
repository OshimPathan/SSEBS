# 🌟 Rebirth - AI-Powered Mental Health & Personal Transformation App

<p align="center">
  <img src="rebirth/assets/images/logo.png" alt="Rebirth Logo" width="150"/>
</p>

<p align="center">
  <strong>Your Personal AI Companion for Mental Wellness & Self-Improvement</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-documentation">API Docs</a>
</p>

---

## 📖 Overview

**Rebirth** is a comprehensive mental health and personal transformation mobile application that combines cutting-edge AI technology with evidence-based psychological approaches. The app provides users with an empathetic AI companion that understands their emotional state through **BERT-based emotion detection** and responds with personalized, emotionally-aware guidance.

### 🎯 Purpose

In today's fast-paced world, mental health support is often inaccessible or stigmatized. Rebirth aims to:

- **Democratize mental wellness** - Provide 24/7 emotional support accessible to everyone
- **Personalized transformation** - Help users become their ideal selves through goal tracking and habit building
- **Emotion-aware conversations** - Use AI to detect emotions and respond with appropriate empathy
- **Track progress** - Monitor emotional patterns and personal growth over time

---

## ✨ Features

### 🧠 BERT-Based Emotion Detection
- Real-time emotion analysis using HuggingFace's BERT model
- Detects 6 core emotions: Joy, Sadness, Anger, Fear, Love, Surprise
- 99%+ accuracy with confidence scores
- Emotion badges displayed on each message

### 💬 AI-Powered Chat
- Emotionally-aware responses powered by Google Gemini AI
- Context-aware conversations that remember user preferences
- Personalized guidance based on onboarding data
- Chat history with session management

### 📊 Analytics & Progress Tracking
- Emotion trend visualization over time
- Mood score calculations
- Goal completion tracking
- Positivity ratio analysis

### 🎨 Theming & Customization
- Light and Dark mode support
- System theme auto-detection
- Persistent theme preferences

### 🔐 Secure Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected API endpoints

### 📱 User Experience
- Smooth scrolling with bounce physics
- Auto-scroll to latest messages
- Enter key to send messages
- Auto-capitalization for sentences
- Multi-line message support

---

## 🛠 Tech Stack

### Frontend (Mobile App)
| Technology | Purpose |
|------------|---------|
| **Flutter** | Cross-platform mobile framework |
| **Dart** | Programming language |
| **Provider** | State management |
| **SharedPreferences** | Local storage |
| **HTTP** | API communication |

### Backend (REST API)
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | Database |
| **Mongoose** | ODM |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |

### AI/ML Services
| Service | Purpose |
|---------|---------|
| **HuggingFace Inference API** | BERT emotion detection |
| **Google Gemini AI** | Response generation |
| **BERT Model** | `bhadresh-savani/bert-base-uncased-emotion` |

### Deployment
| Platform | Purpose |
|----------|---------|
| **Vercel** | Backend hosting (serverless) |
| **MongoDB Atlas** | Cloud database |

---

## 🏗 Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MOBILE APP (Flutter)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Splash    │  │  Onboarding │  │    Chat     │  │   Profile   │    │
│  │   Screen    │  │   Screens   │  │   Screen    │  │   Screen    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │  Analytics  │  │  Settings   │  │    Auth     │                      │
│  │   Screen    │  │   Screen    │  │   Screens   │                      │
│  └─────────────┘  └─────────────┘  └─────────────┘                      │
│                              │                                           │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                    SERVICES LAYER                              │     │
│  │   AuthService  │  ChatService  │  ThemeService  │  OnboardingService │
│  └───────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS REST API
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Node.js/Express)                         │
│                          Hosted on Vercel                                │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                     MIDDLEWARE LAYER                           │     │
│  │   CORS  │  Helmet  │  Rate Limit  │  Auth JWT  │  Compression  │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                              │                                           │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                      ROUTES LAYER                              │     │
│  │   /auth/*    │    /chat/*    │    /onboarding/*               │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                              │                                           │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                   CONTROLLERS LAYER                            │     │
│  │   AuthController  │  ChatController  │  OnboardingController   │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                              │                                           │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                    SERVICES LAYER                              │     │
│  │              EmotionService (BERT Detection)                   │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                              │                                           │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                     MODELS LAYER                               │     │
│  │   User  │  ChatSession  │  ChatMessageBucket  │  ChatMessage   │     │
│  └───────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
          │                         │                         │
          ▼                         ▼                         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  MongoDB Atlas  │    │  HuggingFace    │    │  Google Gemini  │
│   (Database)    │    │  Inference API  │    │      API        │
│                 │    │  BERT Emotion   │    │  AI Responses   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Emotion Detection Flow

```
User Message: "I'm feeling really sad today"
                │
                ▼
┌─────────────────────────────────────┐
│   1. BERT Emotion Detection         │
│   Model: bert-base-uncased-emotion  │
│   API: HuggingFace Inference        │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│   2. Emotion Result                  │
│   {                                  │
│     emotion: "sadness",              │
│     confidence: 0.9986,              │
│     category: "negative",            │
│     severity: "moderate"             │
│   }                                  │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│   3. Build Emotion-Aware Prompt     │
│   - Inject emotion context          │
│   - Apply response strategy         │
│   - Set empathetic tone             │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│   4. Google Gemini API              │
│   - Generate empathetic response    │
│   - Context-aware conversation      │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│   5. Response to User               │
│   "I hear that you're feeling sad   │
│   today. That's completely valid.   │
│   Would you like to talk about      │
│   what's on your mind?"             │
│                                      │
│   [😢 SADNESS 99%]                  │
└─────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ 
- **Flutter** v3.0+
- **MongoDB** (local or Atlas)
- **Git**

### Clone the Repository

```bash
git clone https://github.com/OshimPathan/capstone_project.git
cd capstone_project
```

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd rebirth_backend/rebirth-backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

4. **Configure environment variables:**
```env
# Database
MONGODB_URI=mongodb+srv://your-connection-string

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# AI Services
GEMINI_API_KEY=your-google-gemini-api-key
HUGGINGFACE_API_KEY=your-huggingface-api-key

# Server
PORT=8000
NODE_ENV=development
```

5. **Start the server:**
```bash
npm run dev
```

The backend will run at `http://localhost:8000`

### Frontend Setup

1. **Navigate to Flutter app directory:**
```bash
cd rebirth
```

2. **Install Flutter dependencies:**
```bash
flutter pub get
```

3. **Update API URL (for local development):**

Edit `lib/services/auth_service.dart`:
```dart
static const String _baseUrl = 'http://localhost:8000/api';
```

4. **Run the app:**
```bash
# For iOS
flutter run -d ios

# For Android
flutter run -d android

# For web
flutter run -d chrome
```

### API Keys Required

| Service | Get API Key From |
|---------|------------------|
| **MongoDB Atlas** | [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) |
| **Google Gemini** | [aistudio.google.com](https://aistudio.google.com) |
| **HuggingFace** | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |

---

## 📡 API Documentation

### Base URL
- **Local:** `http://localhost:8000/api`
- **Production:** `https://rebirth-backend-zeta.vercel.app/api`

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user profile |
| PATCH | `/auth/profile` | Update user profile |

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/message` | Send message & get AI response |
| GET | `/chat/sessions` | List all chat sessions |
| GET | `/chat/sessions/today` | Get or create today's session |
| GET | `/chat/sessions/:id/messages` | Get messages for a session |
| PATCH | `/chat/sessions/:id` | Update session (rename) |

### Analytics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat/analytics/emotions` | Get emotion analytics |
| GET | `/chat/analytics/progress` | Get progress tracking data |

### Example: Send Message

**Request:**
```bash
curl -X POST https://rebirth-backend-zeta.vercel.app/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "I am feeling happy today!"}'
```

**Response:**
```json
{
  "text": "That's wonderful to hear! What's making you feel so happy today?",
  "spans": [...],
  "sessionId": "abc123",
  "emotionData": {
    "emotion": "joy",
    "confidence": 0.9987,
    "category": "positive",
    "severity": "none",
    "color": "#10B981"
  }
}
```

---

## 📁 Project Structure

```
capstone_project/
├── README.md                    # This file
├── rebirth/                     # Flutter Mobile App
│   ├── lib/
│   │   ├── main.dart           # App entry point
│   │   ├── Components/         # Reusable UI components
│   │   │   ├── app_colors.dart
│   │   │   ├── buttons.dart
│   │   │   └── page_transitions.dart
│   │   ├── models/             # Data models
│   │   │   ├── chat_message.dart
│   │   │   └── onboarding_data.dart
│   │   ├── pages/              # App screens
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── Home/           # Chat screen
│   │   │   ├── Profile/        # User profile
│   │   │   ├── Analytics/      # Progress tracking
│   │   │   ├── Settings/       # App settings
│   │   │   ├── OnBoarding/     # Onboarding flow
│   │   │   └── Splash/         # Splash screen
│   │   └── services/           # API & business logic
│   │       ├── auth_service.dart
│   │       ├── chat_service.dart
│   │       └── theme_service.dart
│   ├── assets/                 # Images, fonts
│   ├── ios/                    # iOS specific
│   ├── android/                # Android specific
│   └── pubspec.yaml            # Flutter dependencies
│
└── rebirth_backend/            # Node.js Backend
    └── rebirth-backend/
        ├── src/
        │   ├── index.js        # Server entry point
        │   ├── controllers/    # Request handlers
        │   │   ├── auth.controller.js
        │   │   ├── chat.controller.js
        │   │   └── onboarding.controller.js
        │   ├── middleware/     # Auth, validation
        │   │   └── auth.middleware.js
        │   ├── models/         # MongoDB schemas
        │   │   ├── user.model.js
        │   │   ├── chatSession.model.js
        │   │   └── chatMessageBucket.model.js
        │   ├── routes/         # API routes
        │   │   ├── auth.routes.js
        │   │   ├── chat.routes.js
        │   │   └── onboarding.routes.js
        │   └── services/       # Business logic
        │       └── emotion.service.js  # BERT emotion detection
        ├── package.json
        ├── vercel.json         # Vercel deployment config
        └── SYSTEM_ARCHITECTURE.md
```

---

## 🎨 Emotions Detected

| Emotion | Category | Color | Emoji | Response Strategy |
|---------|----------|-------|-------|-------------------|
| Joy | Positive | 🟢 `#10B981` | 😊 | Celebration, encouragement |
| Love | Positive | 🩷 `#EC4899` | ❤️ | Supportive, affirming |
| Sadness | Negative | ⚫ `#6B7280` | 😢 | Empathetic validation |
| Anger | Negative | 🔴 `#EF4444` | 😠 | Calming, non-judgmental |
| Fear | Negative | 🟣 `#8B5CF6` | 😨 | Reassurance, grounding |
| Surprise | Neutral | 🟡 `#F59E0B` | 😮 | Curious exploration |

---

## 🔒 Security

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Helmet.js** - HTTP security headers
- **Rate Limiting** - 100 requests/15 min per IP
- **CORS** - Configured origin whitelist
- **Input Validation** - Sanitized user inputs

---

## 🚢 Deployment

### Backend (Vercel)

The backend is configured for Vercel serverless deployment:

```bash
cd rebirth_backend/rebirth-backend
vercel --prod
```

**Environment Variables in Vercel:**
- `MONGODB_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `HUGGINGFACE_API_KEY`

### Frontend (App Stores)

```bash
# Build iOS
flutter build ios --release

# Build Android
flutter build apk --release
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Oshim Pathan**
- GitHub: [@OshimPathan](https://github.com/OshimPathan)

---

## 🙏 Acknowledgments

- [HuggingFace](https://huggingface.co) for BERT emotion detection model
- [Google](https://ai.google.dev) for Gemini AI API
- [Flutter](https://flutter.dev) for the amazing cross-platform framework
- [Vercel](https://vercel.com) for serverless hosting

---

<p align="center">
  Made with ❤️ for mental wellness
</p>
