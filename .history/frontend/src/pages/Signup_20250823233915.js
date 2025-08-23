import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Eye, EyeOff, User, Mail, Lock, BookOpen } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

export default function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: "",
    username: "",
    password: "",
    course: "MCA",
    semester: "1",
  });

  const [showPassword, setShowPassword] = useState(false);
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
    const { name, username, password, course, semester } = signupInfo;

    if (!name || !username || !password || !course || !semester) {
      toast.error("All fields are required");
      return;
    }

    if (password.length < 4) {
      toast.error("Password must be at least 4 characters long");
      return;
    }

    try {
      const url = "http://localhost:8000/auth/signup";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          password,
          course,
          semester: parseInt(semester, 10),
        }),
      });

      const result = await response.json();
      const { success, message, error } = result;

      if (success) {
        toast.success(message);
        setTimeout(() => navigate("/login"), 1200);
      } else if (error) {
        const details = error?.details?.[0]?.message || "Signup failed!";
        toast.error(details);
      } else {
        toast.error(message);
      }
    } catch (err) {
      toast.error("Something went wrong! Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-purple-100 via-white to-blue-100 items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-500 to-purple-600 text-white p-10">
          <h1 className="text-4xl font-bold mb-4">Join AcadXpert 🚀</h1>
          <p className="text-lg opacity-90 text-center">
            Create your account and kickstart your journey in{" "}
            <span className="font-semibold">learning & growth</span>.
          </p>
        </div>

        {/* Right Panel (Form) */}
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-600">
            Create Account
          </h2>
          <p className="text-center text-gray-500 mt-2 text-sm">
            Fill in your details to get started
          </p>

          <form onSubmit={handleSignup} className="mt-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  onChange={handleChange}
                  value={signupInfo.name}
                  placeholder="Name"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
            </div>

            {/* username */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Username 
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  onChange={handleChange}
                  value={signupInfo.username}
                  placeholder="username
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={handleChange}
                  value={signupInfo.password}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-blue-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Course
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                <select
                  name="course"
                  onChange={handleChange}
                  value={signupInfo.course}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="MCA">MCA</option>
                  <option value="MBA">MBA</option>
                  <option value="MTech">MTech</option>
                </select>
              </div>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Semester
              </label>
              <select
                name="semester"
                onChange={handleChange}
                value={signupInfo.semester}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:opacity-90 transition duration-300 shadow-md"
            >
              Sign Up
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}