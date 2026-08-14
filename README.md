# React Native To-Do App with Authentication & Cloud Sync

A production-ready, full-stack Android To-Do application engineered with **React Native 0.87** (New Architecture enabled, TypeScript) and a secure **Node.js + Express + MongoDB** REST API backend. Features persistent authentication, smart task scoring and sorting, dual-theme support, custom Poppins typography, and offline standalone APK support.

---

## Features

- **Authentication & Security**: User registration, login, and session persistence via JWT and bcrypt password hashing. User data is strictly isolated per account.
- **Task Management (CRUD)**: Create, view, edit, complete, and delete tasks with custom titles, detailed descriptions, priority tiers, and datetime deadlines.
- **Intelligent Task Sorting**: Dynamic multi-variable priority and deadline calculation algorithm that automatically floats urgent, high-priority tasks to the top.
- **Design System & UX**: Fluid bubbly UI design with dark/light theme support, custom Poppins font family, and responsive layout.
- **Standalone Android Release**: Fully self-contained, optimized release APK running natively on modern Android devices without an active Metro bundler.
- **Cloud & Local Backend**: Compatible with both local Node.js development instances and live production endpoints (e.g., Render-hosted API).

---

## Technical Architecture

```
To-do-app/
├── backend/                  # Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Auth & Task business logic
│   │   ├── middleware/       # JWT auth & validation middleware
│   │   ├── models/           # Mongoose schemas (User, Task)
│   │   ├── routes/           # REST route definitions
│   │   ├── app.js            # Express application setup
│   │   └── server.js         # Server entry point
│   └── tests/                # Backend API integration tests
│
└── mobile/                   # React Native CLI Android application
    ├── android/              # Native Android project (AGP 9.2, NDK r27, Java 17)
    │   └── app/src/main/
    │       ├── assets/fonts/ # Poppins typography assets
    │       └── java/         # Native entrypoints (MainActivity, MainApplication)
    ├── src/
    │   ├── api/              # Axios HTTP client & API service layer
    │   ├── components/       # Reusable UI components (buttons, cards, forms)
    │   ├── context/          # State management (AuthContext, ThemeContext, TaskContext)
    │   ├── navigation/       # React Navigation stack
    │   ├── screens/          # Application screens (Auth, TaskList, AddEditTask)
    │   ├── types/            # TypeScript data models & definitions
    │   └── utils/            # Task sorting and helper algorithms
    └── App.tsx               # Application root with safety boundaries
```

### Technology Stack

| Layer | Technologies |
|---|---|
| **Mobile Framework** | React Native `0.87.0`, React `19.2.3`, TypeScript `5.x` |
| **Mobile State & Nav** | React Navigation `7.x`, React Context + `useReducer`, Async Storage |
| **Native Toolchain** | Android Gradle Plugin `9.2.1`, Gradle `9.4.1`, NDK `r27` (`27.1.12297006`), Java `17` |
| **Backend API** | Node.js `22.x`, Express `4.x`, Mongoose `8.x` |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **Database** | MongoDB / MongoDB Atlas |

---

## Sorting Algorithm (`src/utils/sortTasks.ts`)

The application automatically sorts tasks using a prioritized deadline-proximity formula:

1. **Priority Weights**:
   - `high` = $0$
   - `medium` = $1$
   - `low` = $2$
2. **Score Calculation**:
   $$\text{score} = (\text{priorityWeight} \times 1000) + \text{hoursUntilDeadline}$$
3. **Sorting Rules**:
   - Active tasks are ordered in **ascending order of score** (lowest score = highest urgency).
   - **Completed tasks** (`status: 'completed'`) are automatically placed at the bottom of the list regardless of their calculated score.

---

## REST API Specification

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Request Body | Status Codes |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | `{ "email": "...", "password": "..." }` | `201`, `400`, `409` |
| `POST` | `/api/auth/login` | Authenticate user & get JWT token | `{ "email": "...", "password": "..." }` | `200`, `400`, `401` |

### Task Management (`/api/tasks`) *(Header: `Authorization: Bearer <token>`)*

| Method | Endpoint | Description | Request Body | Status Codes |
|---|---|---|---|---|
| `GET` | `/api/tasks` | Fetch authenticated user's tasks | — | `200`, `401` |
| `POST` | `/api/tasks` | Create a new task | `{ "title", "description", "dateTime", "deadline", "priority" }` | `201`, `400`, `401` |
| `PUT` | `/api/tasks/:id` | Update task fields or toggle status | `{ "title"?, "status"?, "priority"?, ... }` | `200`, `400`, `404` |
| `DELETE` | `/api/tasks/:id` | Delete a task | — | `200`, `404` |

---

## Getting Started

### 1. Prerequisites
- **Node.js**: `>= 22.11.0`
- **Java Development Kit (JDK)**: JDK 17 (e.g. `C:\Java17\jdk-17.0.10+7`)
- **Android SDK**: Android 14/15 SDK platforms, Build Tools `37.0.0`, NDK `27.1.12297006`
- **MongoDB**: Local instance at `mongodb://localhost:27017` or MongoDB Atlas URI

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Create a .env file with:
PORT=5000
MONGO_URI=mongodb://localhost:27017/todoapp
JWT_SECRET=your_jwt_secret_key_here

# Start the server
npm start
```
*Backend runs by default at `http://localhost:5000`.*

---

### 3. Mobile Setup & Local Development

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install --legacy-peer-deps

# Configure API endpoint in src/api/client.ts
# For Android Emulator: http://10.0.2.2:5000/api
# For Physical Device / Local WiFi: http://<YOUR_LOCAL_IP>:5000/api
# For Cloud Production: https://to-do-app-c30v.onrender.com/api

# Start Metro Bundler
npx react-native start

# In a separate terminal, build and run on Android
npx react-native run-android
```

---

## Building & Installing Standalone Release APK

To build an optimized, standalone release APK that operates independently without Metro:

```bash
# Navigate to android directory
cd mobile/android

# Build the signed release APK
gradlew assembleRelease
```

### Install Directly to Connected Android Phone

```bash
# 1. Uninstall previous versions
adb uninstall com.mobile

# 2. Install the freshly assembled standalone release APK
adb install -r app/build/outputs/apk/release/app-release.apk

# 3. Launch the application
adb shell monkey -p com.mobile -c android.intent.category.LAUNCHER 1
```

**Generated APK Output**:
```
mobile/android/app/build/outputs/apk/release/app-release.apk
```

---

## Running Tests

### Mobile Unit Tests
```bash
cd mobile
npx jest src/utils/__tests__/sortTasks.test.ts
```

### Backend Integration Tests
```bash
cd backend
npm test
```

---

## License
MIT License. Feel free to use and customize for personal or commercial projects.
