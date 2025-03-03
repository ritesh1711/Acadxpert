import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
        <div>
            {/* ✅ Navbar with Visible Buttons */}
            <nav className="bg-blue-500 p-4 flex justify-between items-center">
                <div className="text-white text-xl font-bold">My App</div>
                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <span className="text-white text-lg font-semibold">
                                {user.name} 👤
                            </span>
                            <button 
                                onClick={() => navigate("/student-profile")} 
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

            {/* ✅ Welcome Message */}
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 shadow-lg rounded-lg text-center">
                    <h1 className="text-3xl font-bold text-blue-500">
                        {user ? `Welcome, ${user.name}! 🎉` : "Loading..."}
                    </h1>
                    <p className="mt-2 text-gray-600">You're successfully logged in.</p>
                </div>
            </div>
        </div>
    );
}
