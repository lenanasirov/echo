# Echo 🎧

A music-focused social diary where users capture the soundtrack of their moments.

Echo allows users to share authentic experiences through:

🎵 A song

😊 A mood

📸 A photo

💭 A personal thought

Instead of creating a curated online identity, Echo focuses on capturing real moments and the emotions connected to them.

---

# 💡 The Idea

In today's social platforms, people often share carefully selected highlights of their lives.

Echo explores a different approach: preserving the small, authentic moments that define our everyday experiences.

Because music is deeply connected to memory, every moment can be represented by a song that captures how we felt at that exact time.

---

# ✨ Vision

## Every moment has a soundtrack.

Echo aims to become a personal timeline of emotions, memories, and experiences — allowing users to revisit their lives through the songs, feelings, and moments that shaped them.

By connecting music, visuals, and personal stories, Echo creates a unique way to remember and share life's moments.

---

# 🎨 Design Philosophy

Echo focuses on creating an emotional and immersive experience.

The design direction:

🌙 **Dark-first aesthetic**

🎧 **Music-centered interactions**

📸 **Authentic moments over curated content**

✨ **Smooth animations and transitions**

🎨 **Visual identity influenced by album artwork and emotions**

---

# 🛠 Tech Stack

## Frontend

* React
* Vite
* Redux Toolkit
* React Router
* Tailwind CSS
* Framer Motion
* React Icons
* Axios

## Backend

* Node.js
* Express.js
* MySQL
* JWT
* bcryptjs

## Browser Storage

* localStorage — frontend-only UI and notification/reminder state
* IndexedDB — locally stored uploaded image files

## Planned External Services

* Spotify API — planned
* Cloudinary — planned

These external services are not currently integrated. Images currently remain in the browser's IndexedDB storage.

---

# 🏗 Application Architecture

Echo follows a client-server architecture where the backend and MySQL database are the source of truth for persistent application data.

Authentication is handled by the backend using JWTs stored in an HttpOnly cookie.

```text
                         ┌──────────────┐
                         │    MySQL     │
                         │   Database   │
                         └──────▲───────┘
                                │
                            Services
                                │
                           Controllers
                                │
                              Routes
                                │
                         ┌──────▼───────┐
                         │ Express API  │
                         └──────▲───────┘
                                │
                         JWT + HttpOnly
                              Cookie
                                │
                              Axios
                                │
                         ┌──────▼───────┐
                         │    Redux     │
                         │    Toolkit   │
                         └──────▲───────┘
                                │
                         ┌──────▼───────┐
                         │    React     │
                         │      UI      │
                         └──────────────┘
```

### Data Flow

Persistent application data follows this flow:

**React UI → Redux → API Service → Express API → MySQL**

When data is loaded:

**MySQL → Express API → API Service → Redux → React UI**

Redux acts as the main frontend application state, while MySQL provides persistent storage across refreshes, browser sessions, and different browsers.

The frontend uses a centralized API/service layer rather than communicating with the backend directly from UI components.

Authentication follows a separate request flow:

```text
React
  ↓
Axios
  ↓
Express API
  ↓
HttpOnly JWT Cookie
  ↓
Authentication Middleware
  ↓
Controller
  ↓
Service
  ↓
MySQL
```

The browser automatically sends the authentication cookie with API requests. The frontend does not directly access or store the JWT.

---

# 💾 Persistence Architecture

Echo uses different storage mechanisms for different types of data.

## Backend / MySQL

Persistent application data is stored in MySQL:

* Users
* User profile information
* Password hashes
* Echo streak data
* Echo cycles
* Memories
* Memory metadata
* Likes
* Comments

The backend is the source of truth for this data.

```text
React
  ↓
Redux
  ↓
API
  ↓
Express
  ↓
MySQL
```

## Authentication Session

Authentication sessions are maintained using a JWT stored in an **HttpOnly `token` cookie**.

The JWT contains the authenticated user's ID and is signed using the server's `JWT_SECRET`.

The browser automatically sends the cookie with requests to the API, while frontend JavaScript cannot directly access the JWT.

This avoids storing authentication tokens in localStorage.

The authentication cookie is configured with:

* `HttpOnly`
* `SameSite=Lax`
* `Secure` in production
* A 7-day cookie lifetime

The JWT expiration itself is configured through `JWT_EXPIRES_IN`.

## localStorage

localStorage is currently used only for frontend-specific state.

### `echo-cycle-ui`

Stores frontend-only Echo cycle state such as:

* Notification state
* Reminder state
* Reminder timing
* Notification/reminder status

The actual Echo cycle itself is stored in MySQL.

```text
localStorage
└── echo-cycle-ui
    └── frontend notification/reminder state
```

The previous persistent keys `echo-user`, `echo-users`, `echo-memories`, and `echo-cycle` are no longer used as the source of application persistence.

User authentication is now handled by the backend JWT authentication system rather than a locally stored mock user.

## IndexedDB

IndexedDB is currently used for uploaded image files.

```text
IndexedDB
└── echo-db
    └── images
        └── uploaded image files
```

Image metadata is associated with memories in MySQL, while the actual image file remains stored locally in the browser.

This means memory metadata can be synchronized across browsers, but locally stored image files are only available in the browser where they were uploaded.

Cloudinary-based image storage is planned for a future iteration.

---

# 🔐 Authentication

Echo uses **JWT-based authentication** with an HttpOnly cookie.

The authentication system provides:

* User registration
* User login
* Session restoration
* Protected API routes
* Logout
* Password hashing
* Duplicate account protection
* Invalid and expired token handling

## Authentication Architecture

The authentication flow is handled by dedicated backend routes, controllers, services, and middleware.

```text
Auth Route
    ↓
Auth Controller
    ↓
Auth Service
    ↓
MySQL
```

Protected routes additionally use:

```text
Request
  ↓
authMiddleware
  ↓
JWT verification
  ↓
req.user
  ↓
Controller
```

### JWT

After successful registration or login, the backend generates a JWT containing the user's ID:

```json
{
  "userId": 123
}
```

The token is signed using:

```env
JWT_SECRET=your-development-secret
```

and its expiration is controlled by:

```env
JWT_EXPIRES_IN=7d
```

The JWT is stored in an HttpOnly cookie named:

```text
token
```

Because the cookie is HttpOnly, client-side JavaScript cannot read the JWT directly.

---

## Registration Flow

Registration follows these steps:

```text
User submits registration form
          ↓
POST /api/auth/register
          ↓
Validate required fields
          ↓
Hash password with bcrypt
          ↓
Create user in MySQL
          ↓
Generate JWT
          ↓
Set HttpOnly authentication cookie
          ↓
Return user data
```

Passwords are never stored in plain text.

The backend hashes passwords using `bcryptjs` with 12 salt rounds before storing them in the `password_hash` column.

A successful registration automatically authenticates the new user.

---

## Login Flow

Login follows these steps:

```text
User submits email + password
          ↓
POST /api/auth/login
          ↓
Find user by email
          ↓
Compare password with password_hash
          ↓
Generate JWT
          ↓
Set HttpOnly authentication cookie
          ↓
Return safe user data
```

The `password_hash` is never returned to the frontend.

Invalid email/password combinations return:

```text
401 Unauthorized
```

without revealing whether the email or password was incorrect.

---

## Session Restoration

When the application starts, the frontend checks whether an authenticated session already exists.

```text
Application starts
       ↓
GET /api/auth/me
       ↓
JWT authentication middleware
       ↓
Verify token
       ↓
Retrieve user from MySQL
       ↓
Restore authenticated frontend state
```

This allows users to remain authenticated across page refreshes without storing the JWT in browser-accessible storage.

---

## Protected Routes

The `authenticate` middleware protects routes that require an authenticated user.

Currently protected routes include:

```text
GET   /api/auth/me
PATCH /api/users/me
```

The middleware:

1. Reads the `token` cookie.
2. Rejects the request if no token exists.
3. Verifies the JWT using `JWT_SECRET`.
4. Extracts the user's ID.
5. Attaches the authenticated user ID to `req.user`.
6. Allows the request to continue.

Missing authentication returns:

```text
401 Unauthorized
```

Invalid or expired tokens also return:

```text
401 Unauthorized
```

---

## Logout Flow

Logout clears the authentication cookie:

```text
POST /api/auth/logout
        ↓
Clear token cookie
        ↓
Return successful logout response
```

No authentication token is stored in localStorage or managed by the frontend.

---

## Authentication Environment Variables

The backend requires the following authentication-related environment variables:

```env
JWT_SECRET=your-development-secret
JWT_EXPIRES_IN=7d
```

### `JWT_SECRET`

Secret key used to sign and verify JWTs.

For production, this must be replaced with a strong, private secret and must not be committed to version control.

### `JWT_EXPIRES_IN`

Controls the lifetime of generated JWTs.

Example:

```env
JWT_EXPIRES_IN=7d
```

The authentication cookie is currently configured with a 7-day lifetime.

---

## Removal of Mock Authentication

Earlier versions of Echo used localStorage-based mock authentication.

That implementation has been removed.

Authentication is now handled by:

```text
React
  ↓
Axios
  ↓
Express
  ↓
JWT + HttpOnly Cookie
  ↓
Authentication Middleware
  ↓
MySQL
```

This provides a real backend authentication foundation rather than relying on browser-local mock session data.

---

# 🏗 Backend Architecture

The Echo backend is located in the `server/` directory and is built with Node.js and Express.js.

## Project Structure

```text
server/
├── src/
│   ├── config/
│   │   └── env.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── memoryController.js
│   │   └── echoCycleController.js
│   │
│   ├── db/
│   │   ├── connection.js
│   │   └── schema.sql
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── memoryRoutes.js
│   │   └── echoCycleRoutes.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── memoryService.js
│   │   └── echoCycleService.js
│   │
│   └── app.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── package-lock.json
```

## Layers

* **`config/`** — Handles application configuration and environment variables.
* **`routes/`** — Defines API endpoints and connects them to controllers.
* **`controllers/`** — Handles HTTP requests, responses, and error forwarding.
* **`services/`** — Contains application logic and database operations.
* **`db/`** — Handles the MySQL connection and database schema.
* **`middleware/`** — Contains shared Express middleware, including authentication and centralized error handling.
* **`app.js`** — Initializes Express, registers middleware and API routes, and starts the server.

### Request Flow

API requests follow a layered architecture:

**Client → Route → Controller → Service → Database**

For example, creating a memory:

```text
POST /api/memories
        ↓
memoryRoutes.js
        ↓
memoryController.js
        ↓
memoryService.js
        ↓
MySQL
```

For protected requests:

```text
PATCH /api/users/me
        ↓
userRoutes.js
        ↓
authMiddleware.js
        ↓
userController.js
        ↓
userService.js
        ↓
MySQL
```

The service layer keeps database operations separate from HTTP request handling, making the backend easier to maintain and extend.

### Environment Configuration

Environment-specific values such as database credentials and authentication configuration are stored in environment variables.

The `.env` file is excluded from version control, while `.env.example` documents the required environment variables without containing sensitive values.

Example:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=echo

JWT_SECRET=your-development-secret
JWT_EXPIRES_IN=7d
```

---

# 🗄 Database Structure

Echo uses MySQL for persistent application data.

The database schema is defined in `server/src/db/schema.sql`.

## Tables

### `users`

Stores user account, profile, authentication, and Echo streak data.

| Column                 | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `id`                   | Unique user identifier                                        |
| `name`                 | User's display name                                           |
| `username`             | Unique username                                               |
| `email`                | Unique email address                                          |
| `password_hash`        | Bcrypt password hash                                          |
| `avatar`               | Optional avatar                                               |
| `bio`                  | Optional user biography                                       |
| `streak`               | Current consecutive Echo cycle streak                         |
| `last_streak_cycle_id` | ID of the most recent cycle associated with the user's streak |
| `created_at`           | User creation timestamp                                       |

Usernames and email addresses are unique and indexed for efficient lookups.

Plain-text passwords are never stored in the database.

---

### `echo_cycles`

Represents the recurring Echo cycles during which users can create memories.

| Column              | Description                          |
| ------------------- | ------------------------------------ |
| `id`                | Unique cycle identifier              |
| `started_at`        | Cycle start timestamp                |
| `ends_at`           | Cycle end timestamp                  |
| `previous_cycle_id` | Reference to the previous Echo cycle |
| `created_at`        | Cycle creation timestamp             |

Each cycle can reference its previous cycle through `previous_cycle_id`, allowing the application to maintain cycle continuity and calculate streaks.

---

### `memories`

Stores the Echoes created by users.

| Column        | Description                           |
| ------------- | ------------------------------------- |
| `id`          | Unique memory identifier              |
| `user_id`     | User who created the memory           |
| `cycle_id`    | Echo cycle associated with the memory |
| `song_id`     | Optional song identifier              |
| `song_title`  | Song title                            |
| `song_artist` | Song artist                           |
| `mood`        | Mood associated with the memory       |
| `caption`     | Optional personal thought             |
| `location`    | Optional location                     |
| `image_url`   | Optional image reference              |
| `created_at`  | Memory creation timestamp             |

Each memory belongs to one user and one Echo cycle.

---

### `memory_likes`

Stores likes associated with memories.

| Column       | Description               |
| ------------ | ------------------------- |
| `memory_id`  | Memory being liked        |
| `user_id`    | User who liked the memory |
| `created_at` | Like creation timestamp   |

The combination of `memory_id` and `user_id` forms the primary key, preventing the same user from liking the same memory more than once.

---

### `memory_comments`

Stores comments made on memories.

| Column       | Description                  |
| ------------ | ---------------------------- |
| `id`         | Unique comment identifier    |
| `memory_id`  | Memory being commented on    |
| `user_id`    | User who created the comment |
| `content`    | Comment text                 |
| `created_at` | Comment creation timestamp   |

---

## Relationships

The database uses foreign keys to maintain relationships between users, memories, Echo cycles, likes, and comments.

```text
users
  │
  ├───< memories
  │       └── user_id → users.id
  │
  ├───< memory_likes
  │       └── user_id → users.id
  │
  ├───< memory_comments
  │       └── user_id → users.id
  │
  └── last_streak_cycle_id → echo_cycles.id


echo_cycles
  │
  ├───< memories
  │       └── cycle_id → echo_cycles.id
  │
  └── previous_cycle_id → echo_cycles.id


memories
  │
  ├───< memory_likes
  │       └── memory_id → memories.id
  │
  └───< memory_comments
          └── memory_id → memories.id
```

### Foreign Key Behavior

The schema uses cascading deletes where appropriate:

* Deleting a user removes their memories, likes, and comments.
* Deleting a memory removes its associated likes and comments.
* Deleting an Echo cycle removes its associated memories.
* Deleting a referenced previous cycle sets `previous_cycle_id` to `NULL`.
* Deleting a cycle referenced by `last_streak_cycle_id` sets that value to `NULL`.

### Indexes

Indexes are defined on fields used for lookups, filtering, relationships, and sorting, including:

* Usernames and email addresses
* Echo cycle start and end times
* Memory user and cycle relationships
* Memory creation timestamps
* Combined `user_id` and `cycle_id` lookups
* Like and comment relationships

These indexes help improve query performance as the application grows.

---

# 🔌 API Endpoints

The Echo backend exposes a REST API under the `/api` prefix.

## Base URL

```text
http://localhost:5000/api
```

## API Response Format

The API uses a consistent response structure.

### Successful Response

```json
{
  "success": true,
  "data": {}
}
```

For endpoints returning multiple resources:

```json
{
  "success": true,
  "data": []
}
```

### Error Response

Errors follow the API's error response structure:

```json
{
  "success": false,
  "message": "Error message"
}
```

---

# 🔐 Authentication Endpoints

### `POST /api/auth/register`

Creates a new user account and automatically authenticates the new user.

**Authentication:** Public

**Required fields:**

```json
{
  "name": "Lena",
  "username": "lena",
  "email": "lena@example.com",
  "password": "password"
}
```

On success, the backend creates the user, hashes the password, generates a JWT, and sets the authentication cookie.

**Response — `201 Created`**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Lena",
    "username": "lena",
    "email": "lena@example.com"
  }
}
```

**Possible errors:**

* `400 Bad Request` — Required fields are missing.
* `409 Conflict` — Email or username already exists.

---

### `POST /api/auth/login`

Authenticates an existing user.

**Authentication:** Public

**Request:**

```json
{
  "email": "lena@example.com",
  "password": "password"
}
```

On successful authentication, the backend generates a JWT and sets the HttpOnly authentication cookie.

**Response — `200 OK`**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Lena",
    "username": "lena",
    "email": "lena@example.com"
  }
}
```

The response does not expose `password_hash`.

**Possible errors:**

* `400 Bad Request` — Required fields are missing.
* `401 Unauthorized` — Invalid email or password.

---

### `GET /api/auth/me`

Returns the currently authenticated user.

**Authentication:** Required

The JWT is read automatically from the `token` HttpOnly cookie.

**Response — `200 OK`**

```json
{
  "success": true,
  "data": {}
}
```

**Possible errors:**

* `401 Unauthorized` — Missing, invalid, or expired authentication token.
* `404 Not Found` — Authenticated user no longer exists.

---

### `POST /api/auth/logout`

Logs out the current browser session by clearing the authentication cookie.

**Authentication:** Not required

**Response — `200 OK`**

```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

# ❤️ Users

### `GET /api/users`

Retrieves all users.

Users are returned in descending order by `created_at`.

**Authentication:** Public

### `POST /api/users`

Creates a user record.

**Authentication:** Public

The database initializes:

* `streak` to `0`
* `last_streak_cycle_id` to `NULL`
* `created_at` automatically

> Normal application registration should use `/api/auth/register`, which also handles password hashing and authentication.

### `PATCH /api/users/me`

Updates the currently authenticated user's profile and persistent streak data.

**Authentication:** Required

The authenticated user is identified from the JWT rather than from a user ID supplied by the client.

---

# 🎧 Memories

### `GET /api/memories`

Retrieves all memories.

Memories are returned in descending order by `created_at`.

Each memory includes the associated user's basic information through a database join.

### `POST /api/memories`

Creates a new memory.

After creation, the API retrieves the newly created memory together with its associated user information and returns it using the same database response structure as `GET /api/memories`.

---

# 🔄 Echo Cycles

### `GET /api/echo-cycles`

Retrieves all Echo cycles.

Cycles are returned in descending order by `started_at`.

### `POST /api/echo-cycles`

Creates a new Echo cycle.

`previousCycleId` is optional and is stored as `NULL` when not provided.

The service converts supplied timestamps into MySQL-compatible timestamp values before storing them.

---

## HTTP Status Codes

| Status Code                 | Usage                                        |
| --------------------------- | -------------------------------------------- |
| `200 OK`                    | Successful request                           |
| `201 Created`               | Resource successfully created                |
| `400 Bad Request`           | Missing or invalid required request data     |
| `401 Unauthorized`          | Authentication is missing or invalid         |
| `404 Not Found`             | Requested resource does not exist            |
| `409 Conflict`              | Resource conflicts with existing unique data |
| `500 Internal Server Error` | Server or database error                     |

The API is designed to maintain consistent response and error formats as additional endpoints are introduced.

---

# ✨ Current Features

## Core Experience

* [x] React project setup
* [x] Initial design system
* [x] Landing page
* [x] Feed
* [x] User registration and login
* [x] JWT-based authentication
* [x] Protected API routes
* [x] Persistent user sessions
* [x] User profiles
* [x] Create memories
* [x] Song selection
* [x] Mood selection
* [x] Photo upload
* [x] Echo cycles
* [x] Echo cycle notifications and reminders
* [x] Echo streak tracking
* [x] Backend persistence
* [x] MySQL database
* [x] Redux-based application state
* [x] Backend loading and error handling

## Social Features

* [x] Feed memory interactions
* [ ] Comments and reactions
* [ ] Friends
* [ ] Social/OAuth authentication

---

# 🔮 Planned Features

* [ ] Spotify API integration
* [ ] Cloud-based image storage
* [ ] Advanced friend interactions
* [ ] Personal music statistics
* [ ] Yearly "Sound Journey" recap
* [ ] React Native mobile application

---

# 🎧 How It Works

The main experience:

1. Create an account or sign in
2. Capture a moment
3. Choose the song that represents it
4. Select your current mood
5. Add a photo and personal thought
6. Share the moment with friends
7. Revisit memories through your personal soundtrack

---

# 📸 Screenshots

Coming soon...

---

# 📌 Project Status

Echo is currently under active development.

The project is being built using a structured workflow with GitHub Issues, feature-based development, and iterative UX improvements.

The current architecture uses **MySQL as the source of truth for persistent application data**, with Redux managing frontend application state.

Persistent data flows through:

```text
React
  ↓
Redux
  ↓
API Service
  ↓
Express
  ↓
MySQL
```

Authentication sessions are handled separately through a backend-generated JWT stored in an HttpOnly cookie.

```text
React
  ↓
Axios
  ↓
Express API
  ↓
JWT + HttpOnly Cookie
```

Browser-specific storage is intentionally limited to:

* Frontend Echo cycle notification/reminder state
* Locally stored image files

Real backend authentication has been implemented, including registration, login, session restoration, protected routes, password hashing, JWT validation, and logout.

Cloud image storage, Spotify integration, additional social functionality, and the mobile application remain planned for future iterations.

---

# 👤 Author

Built by Lena Nasirov

Full-Stack / Frontend Developer
