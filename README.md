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

## Backend

* Node.js
* Express.js
* MySQL
* Axios

## Local Storage

* localStorage — temporary frontend session/UI state
* IndexedDB — locally stored uploaded image files

## Planned External Services

* Spotify API — planned
* Cloudinary — planned

These external services are not currently integrated. Images currently remain in the browser's IndexedDB storage.

---

# 🏗 Application Architecture

Echo follows a client-server architecture where the backend and MySQL database are the source of truth for persistent application data.

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

---

# 💾 Persistence Architecture

Echo currently uses different storage mechanisms for different types of data.

## Backend / MySQL

Persistent application data is stored in MySQL:

* Users
* User profile information
* Echo streak data
* Echo cycles
* Memories
* Memory metadata

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

## localStorage

localStorage is currently used only for frontend-specific or temporary state.

### `echo-user`

Stores the currently active mock-authenticated user locally.

This is temporary compatibility state used while real authentication has not yet been implemented.

The actual user record and profile data are stored in MySQL.

### `echo-cycle-ui`

Stores frontend-only Echo cycle state such as:

* Notification state
* Reminder state
* Reminder timing
* Notification/reminder status

The actual Echo cycle itself is stored in MySQL.

```text
localStorage
├── echo-user       → temporary mock session state
└── echo-cycle-ui   → frontend notification/reminder state
```

The previous persistent keys `echo-users`, `echo-memories`, and `echo-cycle` are no longer used.

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
│   │   ├── userController.js
│   │   ├── memoryController.js
│   │   └── echoCycleController.js
│   │
│   ├── db/
│   │   ├── connection.js
│   │   └── schema.sql
│   │
│   ├── middleware/
│   │   └── errorHandler.js
│   │
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── memoryRoutes.js
│   │   └── echoCycleRoutes.js
│   │
│   ├── services/
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
* **`middleware/`** — Contains shared Express middleware, including centralized error handling.
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

The service layer keeps database operations separate from HTTP request handling, making the backend easier to maintain and extend.

### Environment Configuration

Environment-specific values such as database credentials and server configuration are stored in environment variables.

The `.env` file is excluded from version control, while `.env.example` documents the required environment variables without containing sensitive values.

---

# 🗄 Database Structure

Echo uses MySQL for persistent application data.

The database schema is defined in `server/src/db/schema.sql`.

## Tables

### `users`

Stores user profile information and Echo streak data.

| Column                 | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `id`                   | Unique user identifier                                        |
| `name`                 | User's display name                                           |
| `username`             | Unique username                                               |
| `email`                | Unique email address                                          |
| `avatar`               | Optional avatar                                               |
| `bio`                  | Optional user biography                                       |
| `streak`               | Current consecutive Echo cycle streak                         |
| `last_streak_cycle_id` | ID of the most recent cycle associated with the user's streak |
| `created_at`           | User creation timestamp                                       |

Usernames and email addresses are unique and indexed for efficient lookups.

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

Errors are forwarded to the centralized error-handling middleware and follow the API's error response structure:

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Health Checks

### `GET /api/health`

Checks whether the Echo API is running.

**Response — `200 OK`**

```json
{
  "success": true,
  "message": "Echo API is running"
}
```

---

### `GET /api/health/db`

Checks whether the backend can establish a connection to the MySQL database.

**Response — `200 OK`**

```json
{
  "success": true,
  "message": "Database connection is working"
}
```

**Response — `500 Internal Server Error`**

```json
{
  "success": false,
  "message": "Database connection failed"
}
```

---

# 👤 Users

### `GET /api/users`

Retrieves all users.

Users are returned in descending order by `created_at`.

### `POST /api/users`

Creates a new user.

The database initializes:

* `streak` to `0`
* `last_streak_cycle_id` to `NULL`
* `created_at` automatically

### `PATCH /api/users/:id`

Updates an existing user's profile and persistent streak data.

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
* [x] User registration and login flow
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
* [ ] Full social authentication

The current authentication flow is intentionally a temporary mock-authentication implementation and does not provide production authentication or authorization.

---

# 🔮 Planned Features

* [ ] Spotify API integration
* [ ] Cloud-based image storage
* [ ] Real user authentication
* [ ] Advanced friend interactions
* [ ] Personal music statistics
* [ ] Yearly "Sound Journey" recap
* [ ] React Native mobile application

---

# 🎧 How It Works

The main experience:

1. Capture a moment
2. Choose the song that represents it
3. Select your current mood
4. Add a photo and personal thought
5. Share the moment with friends
6. Revisit memories through your personal soundtrack

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

Browser-specific storage is intentionally limited to:

* Temporary mock authentication session state
* Frontend notification/reminder state
* Locally stored image files

Real authentication, cloud image storage, Spotify integration, and additional social functionality remain planned for future iterations.

---

# 👤 Author

Built by Lena Nasirov

Full-Stack / Frontend Developer
