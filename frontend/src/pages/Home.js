import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [userName, setUserName] = useState("User"); // Default to "User"
  const navigate = useNavigate();

  // Fetch user details from localStorage when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");

    if (!token) {
      navigate("/login"); // Redirect if no token found
    } else {
      setUserName(name || "User"); // Set name or default to "User"
    }
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    navigate("/login"); // Redirect to login
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg max-w-md text-center">
        <h1 className="text-3xl font-bold text-blue-500">Welcome, {userName}! 🎉</h1>
        <p className="mt-2 text-gray-600">You're successfully logged in.</p>
        
        <button
          onClick={handleLogout}
          className="mt-6 bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 focus:outline-none"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
