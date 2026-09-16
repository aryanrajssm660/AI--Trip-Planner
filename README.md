# AI Trip Planner

![Stack](https://img.shields.io/badge/Stack-MERN-green) ![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange) ![Maps](https://img.shields.io/badge/Maps-OpenStreetMap-blue) ![Routing](https://img.shields.io/badge/Routing-OSRM-purple) ![Auth](https://img.shields.io/badge/Auth-JWT-red) ![Deployment](https://img.shields.io/badge/Deployment-Render-black) ![License](https://img.shields.io/badge/License-MIT-yellow)

**AI Trip Planner** is a full-stack MERN application that uses AI-assisted reasoning and free, open-source mapping services to generate intelligent travel itineraries in real time.

The system focuses on practical integration, scalability, and user-centric planning with **zero paid API dependencies** for core functionality.

---

## TL;DR

AI Trip Planner combines **Google Gemini AI**, **OpenStreetMap**, and **OSRM routing** to create personalized travel plans with live location data, secure authentication, and a production-ready MERN architecture—**all using free, open-source services**.

---

## Links

- **Live Application**: [https://ai-trip-planner-f39y.onrender.com/](https://ai-trip-planner-f39y.onrender.com/)
- **Demo Video**: [Watch Demo Video (Google Drive)](https://drive.google.com/file/d/13JRRaAsfEpGr4SK74McZaUzs9DsIKhR5/view?usp=drivesdk)
- **GitHub Repository**: [https://github.com/Himanshusinghyadavup61/Ai-trip-planner](https://github.com/Himanshusinghyadavup61/Ai-trip-planner)
- **Developer Profile**: [https://github.com/Himanshusinghyadavup61](https://github.com/Himanshusinghyadavup61)

---

## Problem Statement

Most AI travel applications act as simple text chatbots that output unstructured, hard-to-read walls of text. This presents several key technical challenges:

- **Unstructured & Non-Interactive Outputs**: Chatbot responses cannot be easily expanded, reordered, or explored visually on interactive maps.
- **Unpredictable AI Failures**: Real LLMs frequently return malformed JSON, invalid data shapes, slow network responses, or rate limits that crash client frontends.
- **Stale State & Race Conditions**: Asynchronous AI calls can cause out-of-order responses to overwrite newer user inputs if not managed with proper lifecycle states.
- **API Key Vulnerabilities**: Client-side LLM calls risk exposing secret API keys in the browser bundle.

---

## Solution Overview

**AI Trip Planner** solves this by taking free-form user trip inputs and turning the result into an **interactive, stateful planning tool** rather than a chatbot:

- **Structured Data Parsing**: Prompts Google Gemini AI for strict JSON schemas and parses the output into interactive, day-by-day expandable timeline cards, activity badges, and cost breakdowns.
- **Resilient AI Failure Handling**: Implements JSON sanitization, markdown stripping, and an automatic dynamic fallback generator to ensure zero UI crashes when the model encounters errors, rate limits, or bad output.
- **Integrated Free Mapping**: Embeds interactive OpenStreetMap, Nominatim geocoding, and OSRM routing with zero paid API dependencies.
- **Secure Backend Routing**: Proxies all LLM requests through a protected Express server to keep API keys completely safe from client exposure.
- **Session Persistence**: Saves generated trips and drafts to MongoDB Atlas for instant retrieval on the user Dashboard.

---

## Core Features

### AI-Powered Trip Planning

- **Personalized itinerary generation** using Google Gemini AI
- **Destination-based activity suggestions** with timing and cost estimates
- **Day-wise structured planning** with activities, meals, and transportation
- **Preference-aware optimization** (budget, duration, interests, travel style)
- **Multi-day support** (1-30+ days)
- **Cost breakdown** for each activity and day

### Location & Navigation (100% Free Services)

- **OpenStreetMap integration** for live location tracking
- **Nominatim geocoding** for address-to-coordinates conversion
- **Overpass API** for nearby places discovery (restaurants, attractions, parks, etc.)
- **OSRM routing** for directions and route optimization
- **Map-based UX** for trip exploration and planning
- **Saved locations** for favorite destinations

### User System

- **Secure JWT-based authentication** with dual-token system
  - Access tokens (15 minutes)
  - Refresh tokens (7 days, HTTP-only cookies)
- **Persistent login** with "Remember Me" functionality
- **Account security features**:
  - Password hashing with bcrypt (14 rounds)
  - Account lockout after 5 failed attempts
  - Rate limiting on sensitive endpoints
- **User dashboard** for:
  - Saved trips
  - Trip history
  - User preferences
  - Profile management

### Modern User Interface

- **Responsive design** optimized for desktop, tablet, and mobile
- **Smooth animations** powered by Framer Motion
- **Interactive components**: Dynamic forms, modals, tooltips, notifications
- **Real-time updates** via Socket.IO
- **PDF export** for trip itineraries
- **Clean, intuitive UX** with Tailwind CSS

---

## Handling Bad & Unpredictable AI Output (Failure Handling)

A core focus of this application is converting raw, unpredictable LLM text into **reliable, stateful, interactive UI** without crashes:

1. **Structured Data Parsing & Markdown Stripping**:
   - The backend prompts Gemini for strict JSON structures and automatically strips extraneous markdown formatting (e.g., ````json ... ````) and anomalous characters before parsing.

2. **Multi-Tier Dynamic Fallback Engine**:
   - If the AI model returns malformed JSON, throws a rate-limit (HTTP 429), suffers network timeouts, or fails to respond, the backend automatically transitions to a **dynamic itinerary generation engine**.
   - Users are guaranteed a rich, customized, multi-day itinerary with realistic activities, timings, and local eateries—ensuring zero UI crashes or blank screens.

3. **Stateful UI & Stale Response Prevention**:
   - Uses React state and React Query mutations to track request lifecycle (`idle`, `loading`, `success`, `error`).
   - Prevents race conditions and stops stale API responses from overwriting newer user requests.

4. **Comprehensive Loading, Empty, and Error States**:
   - Real-time animated loading spinners during generation.
   - User-friendly error banners with one-click retry capabilities.

---

## AI-Usage Note

In accordance with the assignment guidelines:
- **AI Tools Used**: Used AI assistants (ChatGPT / Claude / Copilot) for prompt engineering and iterative schema refinement, error-handling scaffolding, and test cases.
- **Original Implementation**: All component hierarchies, state management flows, full-stack API integration, OpenStreetMap & routing hooks, security configurations, and live cloud deployment were designed, tested, and implemented by the developer.

---

## System Architecture

### Frontend Architecture

```
React SPA
├── Component-based UI (modular, reusable)
├── Tailwind CSS (responsive styling)
├── Framer Motion (smooth transitions)
├── React Router (client-side routing)
├── React Query (data fetching & caching)
├── Context API (global state management)
└── Axios (HTTP client with interceptors)
```

### Backend Architecture

```
Node.js + Express REST API
├── MongoDB + Mongoose (data persistence)
├── JWT Authentication (dual-token system)
├── Socket.IO (real-time communication)
├── Winston (structured logging)
├── Helmet + CORS (security)
├── Rate Limiting (abuse prevention)
└── Modular route & service layers
```

---

## Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework with hooks and context |
| **React Router v6** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Smooth animations |
| **React Query (TanStack)** | Data fetching & caching |
| **React Hook Form** | Form handling with validation |
| **Axios** | HTTP client |
| **Socket.IO Client** | Real-time communication |
| **React Icons** | Icon library |
| **React Leaflet** | Interactive maps (OpenStreetMap) |
| **Chart.js** | Data visualization |

### Backend

| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Secure authentication |
| **bcryptjs** | Password hashing |
| **Socket.IO** | Real-time communication |
| **Winston** | Advanced logging |
| **Helmet** | Security headers |
| **Express Validator** | Input validation |
| **Compression** | Response compression |

### External Services (All Free)

| Service | Purpose | Cost |
|---------|---------|------|
| **Google Gemini AI** | AI itinerary generation | FREE (60 req/min) |
| **OpenStreetMap** | Map tiles and data | FREE |
| **Nominatim** | Geocoding | FREE |
| **Overpass API** | POI search | FREE |
| **OSRM** | Routing & directions | FREE |

---

## Project Structure

```
AI-TripPlanner/
├── client/                          # React Frontend
│   ├── public/
│   │   ├── index.html              # HTML template
│   │   └── manifest.json           # PWA manifest
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── auth/              # Login, Register, ProtectedRoute
│   │   │   ├── common/            # Button, Input, Modal, Card
│   │   │   ├── layout/            # Header, Footer, Sidebar
│   │   │   ├── maps/              # Map components (Leaflet)
│   │   │   └── trip/              # Trip cards, detail views
│   │   ├── contexts/              # React Context
│   │   │   ├── AuthContext.js    # Authentication state
│   │   │   └── NotificationContext.js  # Real-time notifications
│   │   ├── hooks/                 # Custom hooks
│   │   ├── pages/                 # Application pages
│   │   │   ├── Home.js           # Landing page
│   │   │   ├── Dashboard.js      # User dashboard
│   │   │   ├── TripPlanner.js    # AI trip planning
│   │   │   ├── TripDetail.js     # Trip detail view
│   │   │   ├── Maps.js           # Interactive maps
│   │   │   ├── Trips.js          # Trip list
│   │   │   ├── Profile.js        # User profile
│   │   │   └── auth/             # Login, Register
│   │   ├── services/              # API layer
│   │   │   └── api.js            # Axios config & endpoints
│   │   ├── App.js                # Main app component
│   │   ├── index.js              # React entry point
│   │   └── index.css             # Global styles
│   └── package.json
│
├── server/                          # Node.js Backend
│   ├── controllers/                # Route controllers
│   │   ├── aiController.js        # AI itinerary generation
│   │   ├── authControllerNew.js   # Authentication logic
│   │   ├── mapsController.js      # Maps & location services
│   │   └── tripController.js      # Trip CRUD operations
│   ├── middleware/                 # Express middleware
│   │   ├── auth.js               # JWT authentication
│   │   ├── logging.js            # Winston logger
│   │   └── security.js           # Security headers & rate limiting
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js               # User model
│   │   └── Trip.js               # Trip model
│   ├── routes/                     # Express routes
│   │   ├── ai.js                 # AI endpoints
│   │   ├── authNew.js            # Auth endpoints
│   │   ├── maps.js               # Maps endpoints
│   │   ├── trips.js              # Trip endpoints
│   │   └── users.js              # User endpoints
│   ├── services/                   # External integrations
│   │   ├── geminiService.js      # Google Gemini AI
│   │   └── freeMapService.js     # OSM, Nominatim, OSRM
│   ├── utils/                      # Utilities
│   │   └── tokens.js             # JWT token management
│   ├── server.js                  # Express app setup
│   ├── .env.example              # Environment template
│   └── package.json
│
├── .gitignore
├── package.json                    # Root scripts
└── README.md
```

---

## Setup & Installation

### Prerequisites

- **Node.js** v14+ ([Download](https://nodejs.org/))
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Git** ([Download](https://git-scm.com/))

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/Himanshusinghyadavup61/Ai-trip-planner.git
cd Ai-trip-planner

# 2. Install all dependencies
npm run install-all

# Or install manually:
npm install                    # Root dependencies
cd server && npm install       # Server dependencies
cd ../client && npm install    # Client dependencies
```

### Environment Configuration

Create `server/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ai-trip-planner
MONGODB_URI_PROD=your_mongodb_atlas_uri_here

# JWT Secrets (Generate strong random strings)
JWT_ACCESS_SECRET=your_super_secure_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_min_32_chars
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Google Gemini AI (Required - FREE)
GEMINI_API_KEY=your_gemini_api_key_here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CLIENT_URL=http://localhost:3000

# Security
BCRYPT_ROUNDS=14
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900000

# Optional: Custom User-Agent for OSM services
MAPS_USER_AGENT=AI-TripPlanner/1.0 (Educational Project)
```

Create `client/.env` (optional):

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

### Get API Keys

#### Google Gemini AI (Required - FREE)

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add to `server/.env`: `GEMINI_API_KEY=your_key_here`
5. **Free tier**: 60 requests/minute

#### MongoDB Atlas (Recommended for Production)

1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Get your connection string
4. Add to `server/.env`: `MONGODB_URI_PROD=mongodb+srv://...`
5. **Important**: Add `0.0.0.0/0` to Network Access (or your server's IP)

---

## Running the Application

### Development Mode

**Option 1: Run both frontend and backend simultaneously** (Recommended)

```bash
# From the root directory
npm run dev
```

**Option 2: Run separately**

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

**Access the application:**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### Production Build

```bash
# Build the client
cd client
npm run build

# Start the server
cd ../server
NODE_ENV=production npm start
```

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/refresh` | Refresh access token | No |
| POST | `/logout` | User logout | Yes |
| GET | `/me` | Get current user | Yes |
| PUT | `/profile` | Update profile | Yes |
| POST | `/change-password` | Change password | Yes |

### AI Trip Planning (`/api/ai`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/generate-itinerary` | Generate AI itinerary | Yes |
| POST | `/optimize-itinerary` | Optimize itinerary | Yes |
| POST | `/travel-suggestions` | Get suggestions | Yes |
| GET | `/recommendations` | Get recommendations | Yes |

### Trip Management (`/api/trips`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all user trips | Yes |
| POST | `/` | Create new trip | Yes |
| GET | `/:id` | Get trip by ID | Yes |
| PUT | `/:id` | Update trip | Yes |
| DELETE | `/:id` | Delete trip | Yes |
| GET | `/stats` | Get trip statistics | Yes |

### Maps & Location (`/api/maps`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/places/nearby` | Get nearby places (OSM) | Yes |
| GET | `/places/search` | Search places | Yes |
| GET | `/directions` | Get directions (OSRM) | Yes |
| GET | `/geocode` | Geocode address | Yes |
| GET | `/reverse-geocode` | Reverse geocode | Yes |
| POST | `/save-location` | Save location | Yes |

---

## Security Features

- **JWT Authentication** with dual-token system
- **Password Hashing** with bcrypt (14 salt rounds)
- **Account Lockout** after 5 failed login attempts
- **Rate Limiting** on all endpoints
- **Input Validation** with express-validator
- **XSS Protection** with xss-clean
- **CORS** configured for specific origins
- **Helmet** for security headers
- **MongoDB Sanitization** to prevent NoSQL injection
- **HTTP-only Cookies** for refresh tokens

---

## Deployment (All-in-One on Render)

The entire full-stack application (Express API + React Client) is deployed together as a single unified service on **Render**:

1. **Connect GitHub to Render**:
   - Create a **New Web Service** on [Render](https://dashboard.render.com/) and connect your repository: `Himanshusinghyadavup61/Ai-trip-planner`.

2. **Configure Service Settings**:
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm run install-all && npm run build`
   - **Start Command**: `cd server && node server.js`
   - **Instance Type**: `Free`

3. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ai-trip-planner?retryWrites=true&w=majority
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-3.6-flash
   JWT_ACCESS_SECRET=your_super_secure_jwt_access_secret
   JWT_REFRESH_SECRET=your_super_secure_jwt_refresh_secret
   SESSION_SECRET=your_super_secure_session_secret
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   ```

4. **Live URL**: [https://ai-trip-planner-f39y.onrender.com/](https://ai-trip-planner-f39y.onrender.com/)

---

## Engineering Learnings

- Integrating **multiple free APIs** (OSM, Nominatim, Overpass, OSRM) in a production system
- Managing **AI latency** and implementing retry logic with Gemini 3.6
- Designing **scalable MERN architectures** with modular services
- Deploying a **unified full-stack architecture on Render** (single origin, serving compiled React static assets directly via Express)
- Building **production-ready API layers** with proper error handling and dynamic fallbacks
- Balancing **AI assistance** with deterministic logic
- Implementing **dual-token JWT** authentication system with automatic silent refresh
- **Rate limiting** and security best practices

---

## Known Limitations

- No hotel booking integration (removed to avoid paid APIs)
- No flight/train booking (removed to avoid paid APIs)
- No collaborative trip planning (yet)
- No offline mode
- AI output quality depends on input clarity
- Free API tiers impose rate limits (Nominatim: 1 req/sec)

---

## Future Roadmap

- Collaborative trip planning (multi-user)
- Saved itinerary versioning
- Advanced cost optimization
- Mobile app (React Native)
- Offline mode with PWA
- Social sharing features
- Multi-language support
- Dark mode

---

## License

This project is licensed under the **MIT License**.

---

## Author

**Himanshu Singh Yadav**  
Full Stack & AI Engineer

- **GitHub**: [@Himanshusinghyadavup61](https://github.com/Himanshusinghyadavup61)
- **Live Application**: [https://ai-trip-planner-f39y.onrender.com/](https://ai-trip-planner-f39y.onrender.com/)
- **Demo Video**: [Watch Demo Video (Google Drive)](https://drive.google.com/file/d/13JRRaAsfEpGr4SK74McZaUzs9DsIKhR5/view?usp=drivesdk)
- **Email**: himanshusinghyadavup61@gmail.com

---

## Acknowledgments

- **Google Gemini AI** for intelligent itinerary generation
- **OpenStreetMap** for free, open-source mapping data
- **Nominatim** for geocoding services
- **OSRM** for routing and directions
- **MongoDB Atlas** for cloud database solutions
- **Render** for cloud application hosting
- **React** and **Node.js** communities

---

## Support

If you encounter issues:

1. Check the [Issues](https://github.com/Himanshusinghyadavup61/Ai-trip-planner/issues) page
2. Create a new issue with detailed information
3. Contact: himanshusinghyadavup61@gmail.com

---

**AI Trip Planner** — Practical AI-assisted travel planning with real-world, free data.

Made with ❤️ by Himanshu Singh Yadav






