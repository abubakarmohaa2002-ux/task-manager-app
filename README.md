# 🚀 Task Manager App (MERN Stack)

> **A powerful and intuitive full-stack Task Manager application built with the MERN stack. Manage your daily productivity with ease, featuring secure authentication and seamless task management.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://task-manager-app-ek4h.vercel.app/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20+%20Vite-blue?style=for-the-badge&logo=react)](https://task-manager-app-ek4h.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20+%20Express-lightgrey?style=for-the-badge&logo=node.js)](https://task-manager-app-1-e9px.onrender.com/)

---

## 🌟 Key Features

- 🔐 **User Authentication**: Secure registration and login using JWT (JSON Web Tokens).
- ✅ **Full CRUD Functionality**: Create, Read, Update, and Delete tasks effortlessly.
- 🛡️ **Protected Routes**: Ensuring your tasks are private and only accessible to you.
- 📱 **Responsive Design**: Modern, clean UI built with Tailwind CSS, optimized for all devices.
- ⚡ **Real-time Feedback**: Loading states, success notifications, and interactive UI elements.
- 🗑️ **Safety First**: Delete confirmation dialogs to prevent accidental data loss.

---

## 🛠️ Tech Stack

### Frontend
- **React.js (Vite)** - Fast and modern frontend framework.
- **Tailwind CSS** - Utility-first CSS for sleek styling.
- **Axios** - Promise-based HTTP client for API requests.
- **React Router DOM** - Smooth client-side navigation.

### Backend
- **Node.js** - JavaScript runtime environment.
- **Express.js** - Minimalist web framework for Node.
- **MongoDB** - Scalable NoSQL database.
- **Mongoose** - Elegant MongoDB object modeling.
- **JWT** - Secure stateless authentication.
- **Bcrypt** - Industry-standard password hashing.

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/task-manager-app.git
cd task-manager-app
```

### 2️⃣ Backend Configuration
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3️⃣ Frontend Configuration
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

Successful registration returns HTTP 201 with only
`{"message":"User created successfully"}`. Successful login returns HTTP 200
with `{"message":"User login successful","token":"<JWT>"}`.
The frontend consumes the message and login token only, so neither response
returns a user document, password hash, timestamps or database version fields.
Registration still redirects to login rather than automatically signing in.

### Tasks (Protected)
- `GET /api/tasks` - Get all tasks for the logged-in user
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update an existing task
- `DELETE /api/tasks/:id` - Delete a task

---

## Backend regression tests

Use Node.js 24 for the built-in test runner and `fetch`:

```bash
cd backend
npm ci --ignore-scripts --no-audit --no-fund
npm test
```

`npm test` runs both files below in separate Node.js test processes.

### Authentication response privacy

`backend/test/auth-response-privacy.test.js` exercises the real Express auth
routes, bcrypt hashing/comparison and JWT signing/verification over loopback
HTTP. It checks registration, successful login and incorrect-password rejection,
including the absence of passwords, password hashes and extra response fields.
Tests substitute in-memory persistence for `User.findOne` and `User.create`,
generate a temporary signing key, and load the router from an empty temporary
working directory so a developer's `.env` is not read. No MongoDB connection or
deployed service is used. These are focused route regression tests, not MongoDB
integration tests or browser/deployment tests.

### Authentication enforcement and task ownership

`backend/test/task-permissions.test.js` sends HTTP requests through the real
`/api` router, authentication middleware and task controllers. It registers and
logs in two fixture users through the real auth routes. Persistence uses actual
Mongoose models and a dedicated MongoDB 8.2.6 process with WiredTiger, started by
the pinned `mongodb-memory-server` development dependency. No model methods are
mocked in this file. The tests verify stored documents after permitted and denied
requests, including ownership, contents, timestamps and database version fields.

Covered cases:

- Owner create/list/update/delete, including the resulting stored data.
- Separate task lists for two users; cross-user update/delete return 404 without
  changing stored data.
- Missing, malformed, incorrectly signed and expired tokens return 401 for each
  protected POST/GET/PUT/DELETE operation without changing stored data.
- A submitted `user` ownership field cannot assign another owner during creation
  or transfer ownership during an otherwise permitted update.

Tests generate temporary credentials, signing keys and a database name, bind HTTP
and MongoDB to TCP loopback (disabling Unix sockets on non-Windows systems), and
remove the temporary database process/files when finished. They do not import
the production startup module, read a developer's
`.env`, accept an external database URI, or contact Render/Vercel/Atlas. The first
run needs access to download the matching MongoDB binary from MongoDB's download
service; later runs use its cache. A startup/download failure fails the suite;
there is no silent skip or mocked-database fallback. Node.js 24 and an OS supported
by the MongoDB binary are required. These local API/database integration tests do
not establish browser behaviour or deployed database/configuration behaviour.

---

## 📂 Project Structure

```text
task-manager-app/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Route logic
│   ├── middleware/     # Auth checks
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   └── index.js        # Entry point
└── frontend/
    ├── src/
    │   ├── components/ # React components
    │   ├── App.jsx     # Main App component
    │   └── main.jsx    # Entry point
    └── tailwind.config.js
```

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions or find bugs, feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

⭐ **If you like this project, give it a star!**
