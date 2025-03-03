import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user] = useState({
    name: "Abhishek",
    email: "Abhishek@gmail.com",
    course: "MCA",
  });

  const navigate = useNavigate();

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="bg-blue-500 p-4 flex justify-between items-center">
        <div className="text-white text-xl font-bold">My App</div>

        <div className="relative">
          {/* Profile Section */}
          <button
            onClick={toggleProfileDropdown}
            className="text-white px-4 py-2 rounded-md focus:outline-none"
          >
            {user.name} 👤
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
              <p className="font-semibold">Profile</p>
              <div className="mt-2">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Course:</strong> {user.course}</p>
              </div>
              <button
                onClick={handleLogout}
                className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Content Area */}
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 shadow-lg rounded-lg text-center">
          <h1 className="text-3xl font-bold text-blue-500">
            Welcome, {user.name}! 🎉
          </h1>
          <p className="mt-2 text-gray-600">You're successfully logged in.</p>
        </div>
      </div>
    </div>
  );
}
