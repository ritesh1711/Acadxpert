import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Corrected to lowercase 'useNavigate'
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate(); // Corrected to lowercase 'navigate'

  const handleChange = (e) => {
    const { name, value } = e.target; // Get name and value from the event target
    setSignupInfo((prevState) => ({
      ...prevState,
      [name]: value, // Update the corresponding field value in state
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault(); // Prevent form submission

    const { name, email, password } = signupInfo;

    // ✅ Check if all fields are filled
    if (!name || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    // ✅ Check password length (min: 6 characters)
    if (password.length < 4) {
      toast.error("Password must be at least 4 characters long");
      return;
    }

    try {
      const url = "https://acadxpert8.onrender.com/auth/signup"; // Replace with your backend URL
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();
      console.log(result);
      const { success, message, error } = result;

      if (success) {
        toast.success(message);
        setTimeout(() => {
          navigate("/login"); // Redirect to login page after success
        }, 1000);
      } else if (error) {
        const details = error?.details?.[0]?.message || "Signup failed!";
        toast.error(details);
      }else if(!success){
        toast.error(message);
      }
    } catch (err) {
      toast.error("Something went wrong! Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center">
      {/* Toast Notification Container */}
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-lg p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-500">AcadXpert</h1>
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-700">Sign Up</h2>

        <form onSubmit={handleSignup}>
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

          <div className="mb-6">
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
