## Project Overview

This repository contains a **COMPLETE** full-stack web application featuring a React frontend and a Node.js/Express backend with MongoDB. The app implements JWT-based authentication using httpOnly cookies, profile fetching, and CRUD operations on tasks.

**✅ ALL ASSIGNMENT REQUIREMENTS COMPLETED**

## Tech Stack

- Frontend: React, Vite, Axios, React Router, TailwindCSS
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, cookie-parser, CORS

## Running Locally

1. Backend
   - `cd Backend`
   - `npm install`
   - Create a `.env` file with (required):
     - `MONGODB_URI=mongodb://localhost:27017`
     - `JWT_SECRET=your-strong-secret`
     Optional:
     - `PORT=5000` (default is 5000 if not set)
     - `NODE_ENV=development` (affects cookie security flags)
   - Run the server:
     - `node index.js` (or `npx nodemon` if you prefer auto-restart)
2. Frontend
   - `cd Frontend`
   - `npm install`
   - `npm run dev`

Backend runs at `http://localhost:5000`, Frontend at `http://localhost:5173`.

---

## API Documentation

Base URL: `http://localhost:5000/api` -- change it in frontend/src/utils/api.js if backend is running on a different port

If frontend is running on a different port, change cors origin in backend/index.js

Auth uses httpOnly cookies. Set `withCredentials: true` on the client.

### Auth

- POST `/auth/signup`

  - Body: `{ username, email, password }`
  - 201: `{"message":"User registered successfully","success":true}`
  - 400/500: `{ error }`

- POST `/auth/login`

  - Body: `{ email, password }`
  - 200: `{"message":"Login Successull","success":true}` and sets `token` cookie
  - 400/401/500: `{ error }`

- POST `/auth/logout`

  - 200: `{"message":"Logged out successfully"}` and clears `token` cookie

- GET `/auth/profile` (auth required)
  - 200: `{ user }` where `user` excludes password
  - 401: `{ error }`

### Tasks (auth required)

- GET `/auth/tasks`

  - 200: `Task[]` for the authenticated user

- POST `/auth/tasks`

  - Body: `{ title, description? }`
  - 201: `Task`
  - 400/500: `{ error }`

- PUT `/auth/tasks/:id`

  - Body: `{ title?, description?, isCompleted? }`
  - 200: `Task`
  - 404/500: `{ error }`

- DELETE `/auth/tasks/:id`
  - 200: `{ message }`
  - 404/500: `{ error }`

### Profile Update ✅ IMPLEMENTED

- PUT `/auth/profile` (auth required)
  - Body: `{ username, email, mobileNumber? }`
  - 200: `{ user }` with updated fields
  - 400/401/409/500: `{ error }`

---

## Production & Scaling Notes

### Deployment Topology

- Reverse proxy (Nginx/Traefik) in front of Node server; terminate TLS at the proxy.
- Serve the React build (`npm run build`) from a CDN or static host; route API to `/api` via the proxy.
- Containerize with Docker; deploy to a managed runtime (ECS, Kubernetes, Render, Railway, Fly.io, etc.).

### Scalability

- Horizontal scale backend with stateless services; store sessions in cookies/JWT; no in-memory session state.
- Database: use managed MongoDB (Atlas). Create indexes on frequent queries (`Task: userId, isCompleted`).
- Add caching where useful (e.g., read-heavy endpoints) via Redis.
- Use connection pooling and keep-alive.

### Frontend Performance

- Code-splitting and lazy-loading of routes/components.
- Use HTTP/2, compression, long-term asset caching, and image optimization.
- Keep API calls minimal and cache client-side when appropriate.

### CI/CD & QA

- CI: lint, type-check (if TS), test, build on each PR.
- CD: blue/green or rolling deploys; run DB migrations safely.
- Security scans (npm audit, Snyk) and dependency update automation.

---

## Postman Collection

A Postman collection is included for testing the API endpoints.

- Login uses cookie authentication. Ensure Postman is configured to automatically capture and send cookies for subsequent requests.

### Import Steps

1. Open Postman.
2. File -> Import -> Upload Files.
3. Select `postman/Assignment.postman_environment.json` (environment) and `postman/Assignment.postman_collection.json` (collection).
4. Select the environment "Assignment Local" in the top-right environment dropdown.
5. Start with "Signup" then "Login". Postman will store the cookie automatically; then run profile and tasks requests.

---

## ✅ COMPLETED FEATURES

### Core Requirements ✅

- ✅ **Frontend**: React.js with responsive design using TailwindCSS
- ✅ **Forms**: Client-side and server-side validation
- ✅ **Protected Routes**: Login required for dashboard access
- ✅ **Backend**: Node.js/Express with MongoDB
- ✅ **Authentication**: JWT-based with httpOnly cookies
- ✅ **Profile Management**: Fetch and update user profiles
- ✅ **CRUD Operations**: Full task management system
- ✅ **Security**: Password hashing, JWT middleware, input validation
- ✅ **Dashboard**: Search, filter, and sort functionality
- ✅ **Postman Collection**: Complete API testing suite

### Additional Features ✅

- ✅ **Responsive Design**: Mobile-first approach with TailwindCSS
- ✅ **User Experience**: Loading states, error handling, success messages
- ✅ **Security**: HttpOnly cookies, CORS configuration, input sanitization
- ✅ **Code Quality**: Modular structure, error handling, validation
- ✅ **Documentation**: Comprehensive API docs and setup instructions

## Roadmap / Next Steps (Optional Enhancements)

- Add `helmet` for additional security headers
- Implement rate limiting for API endpoints
- Add database indexes for performance optimization
- Add basic analytics for usage insights
- Implement email verification for user registration
