# 🏗️ System Design Architecture — AI-Powered Voice-Enabled Todo App

> **Stack**: MongoDB · Express.js · React (Vite) · Node.js · OpenAI API  
> **Deployment**: Backend → Render | Frontend → Vercel  
> **Date**: March 2026

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Tech Stack & Major Libraries](#2-tech-stack--major-libraries)
3. [Project Folder Structure](#3-project-folder-structure)
4. [Database Design (MongoDB)](#4-database-design-mongodb)
5. [Authentication System](#5-authentication-system)
6. [Voice Input & NLP Pipeline](#6-voice-input--nlp-pipeline)
7. [Backend API Reference](#7-backend-api-reference)
8. [Frontend Pages & Components](#8-frontend-pages--components)
9. [Analytics Dashboard](#9-analytics-dashboard)
10. [Environment Variables](#10-environment-variables)
11. [Deployment Guide](#11-deployment-guide)
12. [Implementation Order (Step-by-Step)](#12-implementation-order-step-by-step)

---

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                   │
│                        Deployed on Vercel                        │
│                                                                  │
│  ┌────────────┐  ┌──────────────┐  ┌───────────┐  ┌───────────┐ │
│  │  Auth Pages │  │  Task Board  │  │  Voice    │  │ Analytics │ │
│  │ Login/Sign  │  │  CRUD UI     │  │  Input    │  │ Dashboard │ │
│  │  up         │  │              │  │  Button   │  │ (Charts)  │ │
│  └────────────┘  └──────────────┘  └───────────┘  └───────────┘ │
│                           │                                      │
│                    Axios / Fetch                                  │
│                    (JWT in headers)                               │
└──────────────────────────────┬───────────────────────────────────┘
                               │  HTTPS REST
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                     BACKEND (Express.js)                         │
│                     Deployed on Render                           │
│                                                                  │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐│
│  │ Auth     │  │ Task         │  │ OpenAI NLP   │  │ Analytics ││
│  │ Routes   │  │ Routes       │  │ Service      │  │ Routes    ││
│  │ /auth/*  │  │ /tasks/*     │  │ (parse voice │  │ /analytics││
│  │          │  │              │  │  text)       │  │ /*        ││
│  └──────────┘  └──────────────┘  └──────────────┘  └──────────┘│
│                           │                                      │
│                    Mongoose ODM                                  │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│              MongoDB Atlas (Cloud Database)                      │
│                                                                  │
│      ┌──────────────┐          ┌──────────────┐                  │
│      │  users        │          │  tasks        │                 │
│      └──────────────┘          └──────────────┘                  │
└──────────────────────────────────────────────────────────────────┘
```

### Request Flow (Voice → Task)

```
User speaks → Browser Web Speech API converts to text
  → Frontend sends text to POST /api/tasks/parse-voice
    → Backend calls OpenAI API to extract structured data
      → Returns { title, description, dueDate, priority }
        → Frontend shows confirmation UI
          → User confirms → POST /api/tasks (creates task)
```

---

## 2. Tech Stack & Major Libraries

### Backend

| Package            | Purpose                                  |
|--------------------|------------------------------------------|
| `express`          | HTTP server framework                    |
| `mongoose`         | MongoDB ODM                              |
| `bcryptjs`         | Password hashing                         |
| `jsonwebtoken`     | JWT creation & verification              |
| `openai`           | OpenAI Node SDK for NLP parsing          |
| `cors`             | Cross-origin requests (Vercel ↔ Render)  |
| `dotenv`           | Environment variable loading             |
| `express-validator`| Request body validation                  |
| `helmet`           | Security headers                         |
| `morgan`           | HTTP request logging                     |
| `cookie-parser`    | Parse cookies (refresh tokens)           |
| `nodemon`          | Dev auto-restart                         |

### Frontend

| Package                | Purpose                              |
|------------------------|--------------------------------------|
| `react` + `react-dom`  | UI library                           |
| `vite`                 | Build tool & dev server              |
| `react-router-dom`     | Client-side routing                  |
| `axios`                | HTTP client                          |
| `recharts`             | Charting library for analytics       |
| `react-hot-toast`      | Toast notifications                  |
| `lucide-react`         | Icon library                         |
| `date-fns`             | Date formatting & manipulation       |
| `framer-motion`        | Animations                           |

---

## 3. Project Folder Structure

```
AI-powered-Voice-enabled-Todo-App/
├── Backend/
│   ├── package.json
│   ├── .env                          # never commit — add to .gitignore
│   ├── server.js                     # entry point
│   ├── config/
│   │   └── db.js                     # mongoose connection
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT verify middleware
│   │   ├── errorHandler.js           # global error handler
│   │   └── validate.js               # express-validator runner
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   └── analyticsRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   └── analyticsController.js
│   └── services/
│       └── openaiService.js          # Voice text → structured task
│
├── Frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── .env                          # VITE_API_URL
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── main.jsx                  # React entry
│       ├── App.jsx                   # Router setup
│       ├── api/
│       │   └── axios.js              # Axios instance with interceptors
│       ├── context/
│       │   └── AuthContext.jsx        # Auth state + provider
│       ├── hooks/
│       │   ├── useVoiceInput.js       # Web Speech API hook
│       │   └── useAuth.js            # Auth helper hook
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Dashboard.jsx          # Main task board
│       │   └── Analytics.jsx          # Analytics charts
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── TaskCard.jsx
│       │   ├── TaskForm.jsx           # Manual + voice form
│       │   ├── VoiceButton.jsx        # Mic button with animation
│       │   ├── ConfirmTaskModal.jsx   # Confirm parsed voice data
│       │   ├── ProtectedRoute.jsx
│       │   ├── AnalyticsCharts.jsx
│       │   └── Loader.jsx
│       └── styles/
│           └── index.css              # Global styles
│
├── .gitignore
└── README.md
```

---

## 4. Database Design (MongoDB)

### 4.1 `users` Collection

```js
// models/User.js
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    // stored as bcrypt hash, NEVER plaintext
  },
}, { timestamps: true });
// timestamps adds createdAt, updatedAt automatically

// Index
userSchema.index({ email: 1 });
```

### 4.2 `tasks` Collection

```js
// models/Task.js
const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  dueDate: {
    type: Date,
    default: null,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'delayed'],
    default: 'pending',
  },
  completedAt: {
    type: Date,
    default: null,
    // Set when status changes to 'completed'
  },
  delayedTo: {
    type: Date,
    default: null,
    // New due date when task is delayed
  },
  originalDueDate: {
    type: Date,
    default: null,
    // Store the original due date before delay
  },
  voiceInput: {
    type: String,
    default: null,
    // Raw voice transcript, stored for debugging / audit
  },
}, { timestamps: true });

// Compound index for user queries
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
```

### Entity Relationship

```
┌────────────┐       1 : N       ┌────────────┐
│   User     │───────────────────│   Task     │
│            │                    │            │
│ _id        │                    │ _id        │
│ name       │                    │ user (FK)  │
│ email      │                    │ title      │
│ password   │                    │ description│
│ createdAt  │                    │ dueDate    │
│ updatedAt  │                    │ priority   │
│            │                    │ status     │
│            │                    │ completedAt│
│            │                    │ delayedTo  │
│            │                    │ originalDD │
│            │                    │ voiceInput │
│            │                    │ createdAt  │
│            │                    │ updatedAt  │
└────────────┘                    └────────────┘
```

---

## 5. Authentication System

### Flow

```
SIGNUP:
  Client → POST /api/auth/signup { name, email, password }
    → Server hashes password with bcrypt (salt rounds = 10)
    → Saves user to DB
    → Returns JWT access token (expires: 7d)
    → 201 Created

LOGIN:
  Client → POST /api/auth/login { email, password }
    → Server compares bcrypt hash
    → Returns JWT access token
    → 200 OK

PROTECTED ROUTES:
  Client sends header:  Authorization: Bearer <token>
    → authMiddleware.js verifies with jwt.verify()
    → Attaches req.user = { id, email }
    → Route handler executes
```

### JWT Payload

```json
{
  "id": "60f7b2a5c9e1a23456789abc",
  "email": "user@example.com",
  "iat": 1711939200,
  "exp": 1712544000
}
```

### Key Implementation Details

- **Password**: hashed with `bcryptjs`, 10 salt rounds
- **Token**: signed with `JWT_SECRET` env var, expires in `7d`
- **Frontend Storage**: store token in `localStorage` (simple approach) or `httpOnly` cookie (more secure)
- **Axios Interceptor**: automatically attaches `Authorization: Bearer <token>` header to every request
- **ProtectedRoute component**: checks for valid token, redirects to `/login` if missing

---

## 6. Voice Input & NLP Pipeline

### 6.1 Frontend: Web Speech API

```
                          Browser (Chrome / Edge)
                          ┌──────────────────────┐
User speaks ──────────►   │  Web Speech API       │
                          │  (SpeechRecognition)  │
                          │                       │
                          │  onresult → text      │
                          └──────────┬───────────┘
                                     │
                              raw transcript
                          "Remind me to submit the
                           quarterly report by
                           next Friday"
                                     │
                                     ▼
                          POST /api/tasks/parse-voice
                          { transcript: "..." }
```

**`useVoiceInput.js` hook logic:**

```js
// Custom React hook
function useVoiceInput() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  };

  return { transcript, isListening, startListening, setTranscript };
}
```

### 6.2 Backend: OpenAI NLP Service

**`services/openaiService.js`:**

```js
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function parseVoiceText(transcript) {
  const today = new Date().toISOString().split('T')[0]; // e.g. "2026-03-20"
  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }); // e.g. "Friday"

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',           // cost-effective & fast
    temperature: 0,                  // deterministic output
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a task extraction assistant. Today is ${dayOfWeek}, ${today}.
Extract structured task data from the user's voice input.
Return a JSON object with these exact fields:
{
  "title": "short task title (max 80 chars)",
  "description": "longer description if any context was given, else empty string",
  "dueDate": "ISO 8601 date string (YYYY-MM-DD) or null if no date mentioned",
  "priority": "low" | "medium" | "high" (infer from urgency/language)
}
Rules:
- "next Friday" means the coming Friday from today.
- "tomorrow" means ${tomorrow's date}.
- "end of month" means the last day of the current month.
- If the user says "urgent" or "ASAP", set priority to "high".
- If no urgency clue, default to "medium".
- If the input is unclear or not a task, still do your best to extract a title.`
      },
      {
        role: 'user',
        content: transcript
      }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### 6.3 Handling Ambiguity

| Ambiguous Input | Strategy |
|---|---|
| No date mentioned ("Buy groceries") | `dueDate: null` — frontend shows "No due date" chip, user can optionally set one |
| Relative dates ("next week") | OpenAI resolves relative to current date passed in system prompt |
| Multiple tasks in one sentence ("Buy milk and call dentist") | OpenAI extracts the primary task; user can re-record for the second |
| Non-task input ("What's the weather?") | OpenAI still returns a best-effort title; frontend shows confirmation modal so user can cancel |
| Unclear priority | Default to `"medium"` |

**Key design decision**: Always show a **confirmation modal** after parsing so the user can review & edit the extracted data before the task is actually created. This handles all edge cases gracefully.

---

## 7. Backend API Reference

### Base URL

- **Local**: `http://localhost:5000/api`
- **Production**: `https://your-app-name.onrender.com/api`

---

### 7.1 Auth Routes — `/api/auth`

| Method | Endpoint           | Auth? | Body                                      | Response                                  |
|--------|--------------------|-------|-------------------------------------------|-------------------------------------------|
| POST   | `/api/auth/signup`  | No    | `{ name, email, password }`               | `{ token, user: { id, name, email } }`    |
| POST   | `/api/auth/login`   | No    | `{ email, password }`                     | `{ token, user: { id, name, email } }`    |
| GET    | `/api/auth/me`      | Yes   | —                                         | `{ user: { id, name, email } }`           |

**Validation Rules:**
- `name`: min 2 chars
- `email`: valid email format, must be unique
- `password`: min 6 chars
- Duplicate email → 409 Conflict
- Wrong credentials → 401 Unauthorized

---

### 7.2 Task Routes — `/api/tasks`

All task routes require `Authorization: Bearer <token>`.

| Method | Endpoint                  | Purpose                  | Body / Query                                                       | Response                            |
|--------|---------------------------|--------------------------|--------------------------------------------------------------------|-------------------------------------|
| GET    | `/api/tasks`              | Get all user's tasks     | Query: `?status=pending&sort=-dueDate`                             | `{ tasks: [...] }`                  |
| POST   | `/api/tasks`              | Create a new task        | `{ title, description?, dueDate?, priority? }`                     | `{ task: {...} }`                   |
| PATCH  | `/api/tasks/:id`          | Update a task            | `{ title?, description?, dueDate?, priority?, status? }`           | `{ task: {...} }`                   |
| DELETE | `/api/tasks/:id`          | Delete a task            | —                                                                  | `{ message: "Task deleted" }`       |
| POST   | `/api/tasks/parse-voice`  | Parse voice transcript   | `{ transcript: "..." }`                                           | `{ title, description, dueDate, priority }` |
| PATCH  | `/api/tasks/:id/complete` | Mark complete            | —                                                                  | `{ task: {...} }` (sets `completedAt`)       |
| PATCH  | `/api/tasks/:id/cancel`   | Cancel a task            | —                                                                  | `{ task: {...} }`                             |
| PATCH  | `/api/tasks/:id/delay`    | Delay a task             | `{ newDueDate: "2026-04-01" }`                                     | `{ task: {...} }` (sets `delayedTo`, saves `originalDueDate`) |

**Controller Logic Highlights:**

```
POST /api/tasks
  → validates body
  → creates task with user: req.user.id
  → returns created task

PATCH /api/tasks/:id/complete
  → finds task where _id = id AND user = req.user.id
  → sets status = 'completed', completedAt = new Date()
  → saves and returns

PATCH /api/tasks/:id/delay
  → saves current dueDate into originalDueDate (if not already saved)
  → sets dueDate = newDueDate
  → sets status = 'delayed'
  → saves and returns

POST /api/tasks/parse-voice
  → receives { transcript }
  → calls openaiService.parseVoiceText(transcript)
  → returns extracted { title, description, dueDate, priority }
  → does NOT create the task (frontend confirms first)
```

---

### 7.3 Analytics Routes — `/api/analytics`

All require `Authorization: Bearer <token>`.

| Method | Endpoint                         | Purpose                        | Response                                        |
|--------|----------------------------------|--------------------------------|-------------------------------------------------|
| GET    | `/api/analytics/summary`         | Overall KPI summary            | `{ total, completed, pending, cancelled, delayed, completedOnTime, completedLate, overdue }` |
| GET    | `/api/analytics/completion-trend` | Daily completed tasks (last 30 days) | `{ data: [{ date, count }] }` |
| GET    | `/api/analytics/status-breakdown` | Pie chart data                 | `{ data: [{ status, count }] }` |
| GET    | `/api/analytics/overdue`         | Currently overdue tasks        | `{ tasks: [...] }` |

**Controller Logic for `GET /api/analytics/summary`:**

```js
async function getSummary(req, res) {
  const userId = req.user.id;
  const now = new Date();

  const [total, completed, pending, cancelled, delayed] = await Promise.all([
    Task.countDocuments({ user: userId }),
    Task.countDocuments({ user: userId, status: 'completed' }),
    Task.countDocuments({ user: userId, status: 'pending' }),
    Task.countDocuments({ user: userId, status: 'cancelled' }),
    Task.countDocuments({ user: userId, status: 'delayed' }),
  ]);

  // Completed on time: completedAt <= dueDate
  const completedOnTime = await Task.countDocuments({
    user: userId,
    status: 'completed',
    dueDate: { $ne: null },
    $expr: { $lte: ['$completedAt', '$dueDate'] },
  });

  // Completed late: completedAt > dueDate
  const completedLate = await Task.countDocuments({
    user: userId,
    status: 'completed',
    dueDate: { $ne: null },
    $expr: { $gt: ['$completedAt', '$dueDate'] },
  });

  // Currently overdue: pending + dueDate < now
  const overdue = await Task.countDocuments({
    user: userId,
    status: 'pending',
    dueDate: { $lt: now, $ne: null },
  });

  res.json({
    total, completed, pending, cancelled, delayed,
    completedOnTime, completedLate, overdue,
  });
}
```

---

## 8. Frontend Pages & Components

### 8.1 Routing Map

```
/login          → Login.jsx          (public)
/signup         → Signup.jsx         (public)
/dashboard      → Dashboard.jsx      (protected)
/analytics      → Analytics.jsx      (protected)
```

### 8.2 Page Descriptions

#### Login / Signup Pages
- Clean, centered form card with glassmorphism
- Email + password fields, submit button
- Toggle link between login ↔ signup
- On success: store JWT, redirect to `/dashboard`

#### Dashboard Page (Main Task Board)
```
┌─────────────────────────────────────────────────────────┐
│  Navbar  [Logo]   [Dashboard]  [Analytics]  [Logout]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  🎙️ Voice Input Section                        │    │
│  │  ┌────────────────────────────────────────┐     │    │
│  │  │ [  Type a task or use voice...       ] │     │    │
│  │  └────────────────────────────────────────┘     │    │
│  │  [ 🎤 Speak ]   [ ➕ Add Task ]                │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  Filter: [All ▾] [Pending] [Completed] [Delayed]       │
│                                                         │
│  ┌───────────────────────────────────────────────┐      │
│  │ ☐  Submit quarterly report                    │      │
│  │    Due: Mar 27, 2026 · Priority: High         │      │
│  │    [ ✅ Complete ] [ ⏳ Delay ] [ ❌ Cancel ]  │      │
│  ├───────────────────────────────────────────────┤      │
│  │ ☐  Buy groceries                              │      │
│  │    Due: None · Priority: Medium               │      │
│  │    [ ✅ Complete ] [ ⏳ Delay ] [ ❌ Cancel ]  │      │
│  └───────────────────────────────────────────────┘      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Voice flow**: Click mic → speak → transcript appears in input → auto-sends to `/parse-voice` → confirmation modal opens with extracted data → user edits if needed → confirm → task created with toast notification
- **Filter tabs**: Filter tasks by status
- **Each TaskCard**: shows title, due date, priority badge, status, and action buttons
- **Delay action**: Opens a date picker modal to select new due date

#### Analytics Page
- see Section 9 below

### 8.3 Component Tree

```
App.jsx
├── AuthContext.Provider
│   ├── Navbar
│   ├── Routes
│   │   ├── /login → Login
│   │   ├── /signup → Signup
│   │   ├── /dashboard → ProtectedRoute → Dashboard
│   │   │   ├── TaskForm (input + VoiceButton)
│   │   │   ├── ConfirmTaskModal
│   │   │   ├── FilterTabs
│   │   │   └── TaskCard (×N)
│   │   └── /analytics → ProtectedRoute → Analytics
│   │       └── AnalyticsCharts
│   └── Loader (global)
```

---

## 9. Analytics Dashboard

### 9.1 KPIs & Why They Matter

| KPI | Visual | Why It's Useful |
|-----|--------|-----------------|
| **Completion Rate** | Donut chart (completed vs total) | Shows overall productivity at a glance |
| **Tasks Completed On Time vs Late** | Stacked bar or grouped bar | Measures reliability and planning accuracy |
| **Current Status Breakdown** | Pie chart (pending / completed / cancelled / delayed) | Snapshot of workload distribution |
| **Overdue Tasks Count** | Big number card (red) | Urgent attention needed — which tasks need action NOW |
| **Completion Trend (30 days)** | Line/area chart | Tracks productivity over time — are you improving? |
| **Pending Tasks Count** | Big number card (yellow) | Current workload indicator |
| **Delay Frequency** | Bar chart or percentage | Identifies if you're consistently underestimating deadlines |

### 9.2 Analytics Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  Navbar  [Logo]   [Dashboard]  [Analytics]  [Logout]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Total    │  │ Completed│  │ Pending  │  │ Overdue │ │
│  │   24     │  │   18     │  │    4     │  │    2    │ │
│  │          │  │   75%    │  │          │  │  🔴     │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                                                         │
│  ┌────────────────────────┐  ┌──────────────────────┐   │
│  │  Status Breakdown      │  │ On-Time vs Late      │   │
│  │  (Pie Chart)           │  │ (Bar Chart)          │   │
│  │                        │  │                      │   │
│  │   🟢 Completed  75%   │  │  ██████ On Time: 14  │   │
│  │   🟡 Pending    17%   │  │  ███    Late:     4  │   │
│  │   🔴 Delayed     4%   │  │                      │   │
│  │   ⚫ Cancelled   4%   │  │                      │   │
│  └────────────────────────┘  └──────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Completion Trend (Last 30 Days)                 │   │
│  │  (Area/Line Chart)                               │   │
│  │                                                  │   │
│  │   ╱─╲     ╱╲                                     │   │
│  │  ╱   ╲───╱  ╲───╱╲──╱╲                          │   │
│  │ ╱                    ╲                           │   │
│  │  Mar 1  Mar 8  Mar 15  Mar 20                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 9.3 Recharts Implementation Approach

```jsx
// Status Breakdown Pie
<PieChart>
  <Pie data={statusData} dataKey="count" nameKey="status" />
  <Tooltip />
  <Legend />
</PieChart>

// Completion Trend Line
<AreaChart data={trendData}>
  <XAxis dataKey="date" />
  <YAxis />
  <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
  <Tooltip />
</AreaChart>

// On-Time vs Late Bar
<BarChart data={[{ name: 'On Time', count: 14 }, { name: 'Late', count: 4 }]}>
  <XAxis dataKey="name" />
  <YAxis />
  <Bar dataKey="count" fill="#82ca9d" />
  <Tooltip />
</BarChart>
```

---

## 10. Environment Variables

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/voicetodo?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# CORS
FRONTEND_URL=http://localhost:5173
# In production: https://your-app.vercel.app
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
# In production: https://your-app-name.onrender.com/api
```

> ⚠️ **IMPORTANT**: Add both `.env` files to `.gitignore`. Never commit secrets.

---

## 11. Deployment Guide

### 11.1 Backend → Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Name**: voice-todo-api
   - **Root Directory**: `Backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add environment variables in Render dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - `FRONTEND_URL` = `https://your-app.vercel.app`
   - `NODE_ENV` = `production`
6. Deploy

### 11.2 Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import repo, set **Root Directory** to `Frontend`
3. Framework preset: **Vite**
4. Add environment variable:
   - `VITE_API_URL` = `https://your-app-name.onrender.com/api`
5. Deploy

### 11.3 CORS Configuration

```js
// Backend server.js
app.use(cors({
  origin: process.env.FRONTEND_URL,   // Vercel URL
  credentials: true,
}));
```

### 11.4 MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create free M0 cluster
3. Create database user
4. Whitelist IP `0.0.0.0/0` (for Render's dynamic IPs)
5. Get connection string → put in `MONGODB_URI`

---

## 12. Implementation Order (Step-by-Step)

Follow this order to avoid dependency issues:

### Phase 1: Backend Foundation
```
1. Initialize Backend/package.json          (npm init -y)
2. Install dependencies                      (npm i express mongoose dotenv cors bcryptjs jsonwebtoken openai express-validator helmet morgan)
3. Install dev dependencies                  (npm i -D nodemon)
4. Create server.js                          (Express app + listen)
5. Create config/db.js                       (Mongoose connection)
6. Create .env with all variables
7. Create .gitignore                         (node_modules, .env)
8. Add scripts to package.json               ("dev": "nodemon server.js", "start": "node server.js")
```

### Phase 2: Auth System
```
9. Create models/User.js                     (Schema + bcrypt pre-save hook)
10. Create middleware/authMiddleware.js       (JWT verification)
11. Create middleware/errorHandler.js         (Global error handler)
12. Create controllers/authController.js     (signup, login, getMe)
13. Create routes/authRoutes.js              (Wire up routes)
14. Mount auth routes in server.js
15. Test with Postman: signup → login → /me
```

### Phase 3: Task CRUD
```
16. Create models/Task.js                    (Schema with all fields)
17. Create controllers/taskController.js     (CRUD + complete/cancel/delay)
18. Create routes/taskRoutes.js              (Wire up all routes)
19. Mount task routes in server.js
20. Test all task endpoints with Postman
```

### Phase 4: OpenAI Voice Parsing
```
21. Create services/openaiService.js         (parseVoiceText function)
22. Add POST /api/tasks/parse-voice route    (in taskRoutes.js)
23. Test with sample transcripts in Postman
```

### Phase 5: Analytics API
```
24. Create controllers/analyticsController.js (summary, trend, breakdown)
25. Create routes/analyticsRoutes.js
26. Mount analytics routes in server.js
27. Test all analytics endpoints with seed data
```

### Phase 6: Frontend Setup
```
28. Initialize React + Vite                  (npm create vite@latest ./ -- --template react)
29. Install frontend dependencies            (npm i axios react-router-dom recharts react-hot-toast lucide-react date-fns framer-motion)
30. Set up folder structure                  (pages, components, hooks, context, api, styles)
31. Configure vite.config.js                 (proxy for dev)
32. Create src/api/axios.js                  (Axios instance + interceptors)
```

### Phase 7: Auth UI
```
33. Create AuthContext.jsx                   (Login/logout state management)
34. Create Login.jsx                         (Login form)
35. Create Signup.jsx                        (Signup form)
36. Create ProtectedRoute.jsx                (Auth guard)
37. Create Navbar.jsx                        (Navigation + logout)
38. Set up App.jsx routes
39. Style all auth pages (index.css)
```

### Phase 8: Task Dashboard
```
40. Create Dashboard.jsx                     (Main page)
41. Create TaskForm.jsx                      (Manual input + voice trigger)
42. Create useVoiceInput.js                  (Web Speech API hook)
43. Create VoiceButton.jsx                   (Mic button with pulse animation)
44. Create ConfirmTaskModal.jsx              (Review parsed voice data)
45. Create TaskCard.jsx                      (Individual task with actions)
46. Add filter tabs (pending/completed/delayed/all)
47. Integrate complete/cancel/delay actions
48. Style the dashboard
```

### Phase 9: Analytics UI
```
49. Create Analytics.jsx                     (Analytics page)
50. Create AnalyticsCharts.jsx               (All chart components)
51. Build KPI summary cards
52. Build pie chart + bar chart + line chart
53. Style analytics page
```

### Phase 10: Polish & Deploy
```
54. Add loading spinners (Loader.jsx)
55. Add toast notifications for all actions
56. Add micro-animations with framer-motion
57. Responsive design pass (mobile-friendly)
58. Error boundary + 404 page
59. Final testing end-to-end
60. Deploy Backend to Render
61. Deploy Frontend to Vercel
62. Update CORS + env vars for production
63. Final production testing
```

---

## Appendix: Key Code Snippets

### A. `server.js` (Entry Point)

```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### B. `config/db.js`

```js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### C. `middleware/authMiddleware.js`

```js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
```

### D. `middleware/errorHandler.js`

```js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
```

### E. `src/api/axios.js` (Frontend)

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

> **This document contains everything needed to build the full application. Follow the implementation order in Section 12, and reference the API table, database schemas, and code snippets as you go. No second prompt needed.** ✅
