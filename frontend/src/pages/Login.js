import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
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

    const { email, password } = loginInfo;
    if (!email || !password) {
      toast.error("Both email and password are required!");
      return;
    }

    if (password.length < 4) {
      toast.error("Password must be at least 4 characters long");
      return;
    }

    try {
      const url = "http://localhost:8000/auth/login";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      const { success, message, jwtToken, name, isAdmin, course, semester } =
        result;

      if (success) {
        toast.success("Login successful!");
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("name", name);
        localStorage.setItem("isAdmin", isAdmin || false);
        localStorage.setItem("course", course || "MCA");
        localStorage.setItem("semester", semester || "1");

        setTimeout(() => {
          if (isAdmin) navigate("/admin/dashboard");
          else navigate("/home");
        }, 1200);
      } else {
        toast.error(message || "Invalid credentials!");
      }
    } catch (err) {
      toast.error("Something went wrong! Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-blue-100 via-white to-purple-100 items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Left side illustration / branding */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-500 to-purple-600 text-white p-10">
          <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
          <p className="text-lg opacity-90">
            Login to <span className="font-semibold">AcadXpert</span> and
            continue your learning journey 🚀
          </p>
        </div>

        {/* Right side form */}
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-600">
            Login
          </h2>
          <p className="text-center text-gray-500 mt-2 text-sm">
            Please enter your credentials to continue
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  onChange={handleChange}
                  value={loginInfo.email}
                  placeholder="example@email.com"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  onChange={handleChange}
                  value={loginInfo.password}
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

             
               
            

            {/* Button */}
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm rounded-lg hover:opacity-90 transition duration-300 shadow-md"
            >
              Login
            </button>
          </form>

          {/* Sign up */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign up here
            </Link>
          </p>

          {/* Admin login */}
          <p className="mt-3 text-center text-sm text-gray-500">
            Are you an administrator?{" "}
            <Link to="/admin/login" className="text-purple-600 hover:underline">
              Login to admin panel
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}