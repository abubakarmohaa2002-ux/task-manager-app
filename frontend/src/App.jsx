import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
import TaskPage from "./components/TaskPage.jsx";

// ✅ Protected Route
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("auth-token");

  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>

        {/* ✅ Public routes */}
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* ✅ Protected route */}
        <Route
          path="/tasks"
          element={
            <PrivateRoute>
              <TaskPage />
            </PrivateRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
