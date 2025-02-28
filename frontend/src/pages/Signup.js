import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: "",
    email: "",
    password: "",
    role: "student", // ✅ Default role is "student"
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password, role } = signupInfo;

    console.log("Sending data:", { name, email, password, role }); // ✅ Debug log

    if (!name || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    try {
      const response = await fetch("https://acadxpert.onrender.com/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }), // ✅ Ensure role is correct
      });

      const result = await response.json();
      console.log("Response:", result); // ✅ Debug response

      if (response.ok) {
        toast.success(result.message);
        setTimeout(() => navigate("/login"), 1000);
      } else {
        toast.error(result.errors?.join(", ") || "Signup failed!");
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
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-700">Sign Up</h2>

        <form onSubmit={handleSignup}>
          {/* Name Input */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-600">Full Name</label>
            <input
              type="text"
              onChange={handleChange}
              id="name"
              name="name"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={signupInfo.name}
              required
            />
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email Address</label>
            <input
              type="email"
              onChange={handleChange}
              id="email"
              name="email"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={signupInfo.email}
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              onChange={handleChange}
              id="password"
              name="password"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={signupInfo.password}
              required
            />
          </div>

          {/* Role Selection Dropdown */}
          <div className="mb-6">
            <label htmlFor="role" className="block text-sm font-medium text-gray-600">Select Role</label>
            <select
              id="role"
              name="role"
              value={signupInfo.role}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
