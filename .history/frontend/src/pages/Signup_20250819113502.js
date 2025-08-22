import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: "",
    email: "",
    password: "",
<<<<<<< HEAD
    role: "student", // ✅ Default role
=======
    course: "MCA",
    semester: "1",
>>>>>>> ritesh
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

<<<<<<< HEAD
    if (!name || !email || !password) {
=======
    const { name, email, password, course, semester } = signupInfo;

    // ✅ Check if all fields are filled
    if (!name || !email || !password || !course || !semester) {
>>>>>>> ritesh
      toast.error("All fields are required");
      return;
    }

    if (password.length < 4) {
      toast.error("Password must be at least 4 characters long");
      return;
    }

    try {
<<<<<<< HEAD
      const url = "https://acadxpert8.onrender.com/auth/signup"; // Replace with your backend URL
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
=======
      const url = "https://acadxpert-main.onrender.com/auth/signup"; 
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          course, 
          semester: parseInt(semester, 10) 
        }),
>>>>>>> ritesh
      });

      const result = await response.json();
      console.log("Response:", result);

      if (result.success) {
        toast.success(result.message);
        setTimeout(() => navigate("/login"), 1000);
      } else {
        toast.error(result.message || "Signup failed!");
      }
    } catch (err) {
      toast.error("Something went wrong! Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-500">AcadXpert</h1>
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-700">Sign Up</h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            value={signupInfo.name}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={signupInfo.email}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={signupInfo.password}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />

<<<<<<< HEAD
          <select
            name="role"
            onChange={handleChange}
            value={signupInfo.role}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
=======
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
>>>>>>> ritesh

          <div className="mb-4">
            <label htmlFor="course" className="block text-sm font-medium text-gray-600">Course</label>
            <select
              onChange={handleChange}
              id="course"
              name="course"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={signupInfo.course}
              required
            >
              <option value="MCA">MCA</option>
              <option value="MBA">MBA</option>
              <option value="MTech">MTech</option>
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="semester" className="block text-sm font-medium text-gray-600">Semester</label>
            <select
              onChange={handleChange}
              id="semester"
              name="semester"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={signupInfo.semester}
              required
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
