import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
    rememberMe: false, // New remember me option
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginInfo((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { email, password, rememberMe } = loginInfo;

    if (!email || !password) {
      toast.error("Both email and password are required!");
      return;
    }

    if (password.length < 4) {
      toast.error("Password must be at least 4 characters long");
      return;
    }

    try {
      const url = "https://acadxpert.onrender.com/auth/login"; // Backend URL
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      console.log(result);
      const { success, message, jwtToken, role } = result;

      if (success) {
        toast.success("Login successful!");

        // Store token in localStorage or sessionStorage based on "Remember Me"
        if (rememberMe) {
          localStorage.setItem("token", jwtToken);
          localStorage.setItem("role", role);
        } else {
          sessionStorage.setItem("token", jwtToken);
          sessionStorage.setItem("role", role);
        }

        setTimeout(() => {
          role === "admin" ? navigate("/admin-dashboard") : navigate("/home");
        }, 1000);
      } else {
        toast.error(message || "Invalid credentials!");
      }
    } catch (err) {
      toast.error("Something went wrong! Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-lg p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-500">AcadXpert</h1>
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-700">Login</h2>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email Address</label>
            <input
              type="email"
              onChange={handleChange}
              id="email"
              name="email"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={loginInfo.email}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              onChange={handleChange}
              id="password"
              name="password"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={loginInfo.password}
              required
            />
          </div>

          {/* Remember Me Checkbox */}
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              className="mr-2"
              checked={loginInfo.rememberMe}
              onChange={handleChange}
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-600">Remember Me</label>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">Sign up here</a>
        </p>
      </div>
    </div>
  );
}
