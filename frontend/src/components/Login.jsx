import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://task-manager-app-1-e9px.onrender.com/api/auth/login",
        { email, password }
      );

      const data = res.data;

      setResponse(data.message);

      // ✅ save token
      localStorage.setItem("auth-token", data.token);

      // ✅ move to dashboard
      navigate("/tasks");
    } catch (error) {
      console.error("Login failed", error);

      // ✅ better error message
      setResponse(
        error.response?.data?.message || "Login failed, try again"
      );
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
  <div className="bg-white p-6 rounded-lg shadow-md w-80">

       <h1 className="text-2xl font-bold text-center mb-4">Login</h1>

        {/* ✅ error / success message */}
        {response && (
          <p className="text-center text-sm mt-2 text-red-500">
            {response}
          </p>
        )}

        <form onSubmit={handleLogin} className="mt-4">
          <div className="flex flex-col mb-3">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-2 py-1"
              placeholder="Enter email"
              required
            />
          </div>

          <div className="flex flex-col mb-3">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded px-2 py-1"
              placeholder="Enter password"
              required
            />
          </div>

          <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Login
          </button>
        </form>

        <p className="text-center mt-3">
          Don’t have an account? <Link to="/">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
