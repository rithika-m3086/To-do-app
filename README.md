# React Native To-Do App with Auth

Full-stack Android To-Do application built with React Native CLI (TypeScript) and a custom Node.js + Express + MongoDB REST API backend.

---

## Technical Architecture

### Backend (`/backend`)
- **Runtime**: Node.js + Express
- **Database**: MongoDB via Mongoose
- **Authentication**: JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **Config & Security**: `dotenv`, `cors`
- **Middleware**: `authMiddleware.js` for JWT verification and strict user-scoped data isolation.

### Mobile (`/mobile`)
- **Framework**: React Native CLI + TypeScript
- **Target**: Android
- **State Management**: React Context + `useReducer` (`AuthContext`, `TaskContext`)
- **Storage**: `@react-native-async-storage/async-storage` for persistent JWT sessions
- **Date Picker**: `@react-native-community/datetimepicker`
- **Navigation**: `@react-navigation/native-stack`
- **HTTP Client**: `axios`

---

## Sorting Algorithm (`src/utils/sortTasks.ts`)

Tasks are sorted according to a dynamic score calculation:
- Priority weights: `high = 0`, `medium = 1`, `low = 2`
- `hoursUntilDeadline(task.deadline)`: calculated in hours from current time
- `score(task) = priorityWeight[task.priority] * 1000 + hoursUntilDeadline(task.deadline)`
- Tasks are sorted **ascending by score**.
- **Completed tasks** (`status: 'completed'`) are always sorted to the bottom of the list regardless of score.

---

## Setup & Running Instructions

### 1. Prerequisites
- **Node.js**: >= 22.11.0
- **MongoDB**: Local MongoDB instance running on `mongodb://localhost:27017` or MongoDB Atlas URI.
- **Android Studio & SDK**: Configured with Android Emulator or connected physical device.

### 2. Backend Setup
Navigate to the `backend/` directory:
```bash
cd backend
```

Install dependencies (use `cmd /c "npm install"` on Windows PowerShell to bypass script execution policies):
```bash
cmd /c "npm install"
```

Configure Environment Variables:
Copy `.env.example` to `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/todoapp
JWT_SECRET=supersecretjwtkey_todo_app_2026
```

Start the backend server:
```bash
npm start
```
*The server will run at `http://localhost:5000`.*

---

### 3. Mobile Setup
Navigate to the `mobile/` directory:
```bash
cd mobile
```

Install dependencies:
```bash
cmd /c "npm install"
```

#### Network Configuration (`src/api/client.ts`)
- **Android Emulator**: Uses `http://10.0.2.2:5000/api` (default).
- **Physical Device**: Update `API_BASE_URL` in `src/api/client.ts` to your local machine's IPv4 address (e.g. `http://192.168.1.50:5000/api`).

#### Run on Android
Start Metro Bundler:
```bash
npx react-native start
```

In a separate terminal, launch the Android app:
```bash
npx react-native run-android
```

---

## API Endpoints Spec

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user `{ email, password }` | `201` Created, `400` Validation, `409` Conflict |
| `POST` | `/api/auth/login` | Login user `{ email, password }` | `200` OK, `400` Validation, `401` Unauthorized |

### Task Routes (`/api/tasks`) *(Requires `Authorization: Bearer <token>`)*
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/tasks` | Get user's tasks | `200` OK |
| `POST` | `/api/tasks` | Create task `{ title, description, dateTime, deadline, priority }` | `201` Created, `400` Validation |
| `PUT` | `/api/tasks/:id` | Update task fields / status | `200` OK, `404` Not Found |
| `DELETE` | `/api/tasks/:id` | Delete task | `200` OK, `404` Not Found |

---

## Running Unit & Integration Tests

### Mobile Unit Tests
```bash
cd mobile
cmd /c "npx jest src/utils/__tests__/sortTasks.test.ts"
```

### Backend Integration Tests
```bash
cd backend
cmd /c "npm test"
```
