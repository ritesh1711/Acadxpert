import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentProfile from "./StudentProfile";

export default function Home() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await fetch("http://localhost:8000/auth/user", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch user");
                }

                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error("Error fetching user:", error);
                localStorage.clear();
                navigate("/login");
            }
        };

        fetchUser();
    }, [navigate]);

    // ✅ Logout Function
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* ✅ Navbar with Profile & Logout */}
            <nav className="bg-blue-500 p-4 flex justify-between items-center shadow-md">
                <div className="text-white text-xl font-bold">AcadXpert</div>
                <div className="flex items-center space-x-6">
                    {user ? (
                        <>
                            <span className="text-white font-semibold">
                                {user.name} 👤
                            </span>
                            <button
                                onClick={() => navigate("/StudentProfile")}
                                className="bg-white text-blue-500 px-4 py-2 rounded-md font-semibold shadow-md hover:bg-gray-200 transition"
                            >
                                Student Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold shadow-md hover:bg-red-600 transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <p className="text-white">Loading...</p>
                    )}
                </div>
            </nav>

            {/* ✅ Main Homepage Section */}
            <div className="flex-grow flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-blue-500 mb-8">
                    {user ? `Welcome, ${user.name}! 🎉` : "Loading..."}
                </h1>

                {/* ✅ Menu Options as Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Attendance Card */}
                    <div
                        className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition cursor-pointer"
                        onClick={() => navigate("/attendance")}
                    >
                        <h2 className="text-2xl font-bold text-blue-500 mb-2">📅 Attendance</h2>
                        <p className="text-gray-600">Check your attendance records.</p>
                    </div>

                    {/* Circular Card */}
                    <div
                        className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition cursor-pointer"
                        onClick={() => navigate("/circular")}
                    >
                        <h2 className="text-2xl font-bold text-green-500 mb-2">📢 Circular</h2>
                        <p className="text-gray-600">View important announcements.</p>
                    </div>

                    {/* Feedback Card */}
                    <div
                        className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition cursor-pointer"
                        onClick={() => navigate("/feedback")}
                    >
                        <h2 className="text-2xl font-bold text-yellow-500 mb-2">💬 Feedback</h2>
                        <p className="text-gray-600">Share your feedback with us.</p>
                    </div>
                </div>
            </div>

            {/* ✅ Footer Section */}
            <footer className="bg-blue-600 text-white text-center py-6 mt-10">
                <div className="container mx-auto px-6">
                    <div className="flex flex-wrap justify-center space-x-6 text-lg font-semibold">
                        <a href="/privacy-policy" className="hover:underline transition">
                            📄 Privacy Policy
                        </a>
                        <a href="/terms" className="hover:underline transition">
                            📜 Terms & Conditions
                        </a>
                        <a href="/contact" className="hover:underline transition">
                            📧 Contact Us
                        </a>
                        <a href="/about" className="hover:underline transition">
                            🔗 About AcadXpert
                        </a>
                    </div>
                    <p className="mt-4 text-sm text-gray-200">
                        © {new Date().getFullYear()} AcadXpert. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
