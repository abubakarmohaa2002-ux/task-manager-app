import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://task-manager-app-1-e9px.onrender.com/api/auth/register",
        { name, email, password }
      );

      const data = res.data;

      setResponse(data.message);

      // ✅ redirect to login after success
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("Registration failed", error);

      setResponse(
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="border p-5 rounded-xl w-80">
        <h1 className="text-2xl font-bold text-center">Register</h1>

        {response && (
          <p className="text-center text-sm mt-2 text-red-500">
            {response}
          </p>
        )}

        <form onSubmit={handleRegister} className="mt-4">
          <div className="flex flex-col mb-3">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded px-2 py-1"
              placeholder="Enter name"
              required
            />
          </div>

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

          <button className="w-full bg-green-500 text-white py-1 rounded">
            Register
          </button>
        </form>

        <p className="text-center mt-3">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
``