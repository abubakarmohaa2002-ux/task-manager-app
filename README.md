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

## 📸 Screenshots

### 🔐 Auth Pages
| Login | Register |
|-------|----------|
| ![Login Placeholder](https://via.placeholder.com/400x250?text=Login+Page) | ![Register Placeholder](https://via.placeholder.com/400x250?text=Register+Page) |

### ✅ Task Dashboard
![Dashboard Placeholder](https://via.placeholder.com/800x450?text=Task+Manager+Dashboard)

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

### Tasks (Protected)
- `GET /api/tasks` - Get all tasks for the logged-in user
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update an existing task
- `DELETE /api/tasks/:id` - Delete a task

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
