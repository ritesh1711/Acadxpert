import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StudentProfile from "./StudentProfile";

export default function Home() {
    const [user, setUser] = useState(null);
    const [hasSubmittedAdmission, setHasSubmittedAdmission] = useState(false);
    const [submissionData, setSubmissionData] = useState(null);
    const [hasPendingDocuments, setHasPendingDocuments] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            const storedRole = localStorage.getItem("role");
            const storedName = localStorage.getItem("name");
            
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
                // Ensure role information is included
                setUser({
                    ...data,
                    role: data.role || storedRole || "student",
                    name: data.name || storedName
                });
            } catch (error) {
                console.error("Error fetching user:", error);
                
                // Use the localStorage data as fallback if API fails
                if (storedName) {
                    setUser({
                        name: storedName,
                        role: storedRole || "student"
                    });
                } else {
                    localStorage.clear();
                    navigate("/login");
                }
            }
        };

        const checkAdmissionStatus = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get('http://localhost:8000/admission/user/admission', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    setHasSubmittedAdmission(true);
                    setSubmissionData(response.data.data);
                    
                    // Check if there are pending documents
                    if (response.data.data.documentStatus) {
                        const hasPending = Object.values(response.data.data.documentStatus).some(status => status.pending);
                        setHasPendingDocuments(hasPending);
                    }
                }
            } catch (err) {
                // If error is not 404 (not found), log it
                if (err.response && err.response.status !== 404) {
                    console.error("Error checking admission status:", err);
                }
                // No need to handle 404 as it just means the user hasn't submitted a form yet
            }
        };

        fetchUser();
        checkAdmissionStatus();
    }, [navigate]);

    // ✅ Logout Function
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* ✅ Navbar with Profile & Logout */}
            <nav className="bg-blue-500 p-2 sm:p-4 flex flex-wrap justify-between items-center shadow-md">
                <div className="text-white text-lg sm:text-xl font-bold">AcadXpert</div>
                <div className="flex flex-wrap items-center space-x-2 sm:space-x-6 mt-2 sm:mt-0">
                    {user ? (
                        <>
                            <span className="text-white text-sm sm:text-base font-semibold">
                                {user.name} 👤
                            </span>
                            
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-md font-semibold shadow-md hover:bg-red-600 transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <p className="text-white text-sm">Loading...</p>
                    )}
                </div>
            </nav>

            {/* ✅ Main Homepage Section */}
            <div className="flex-grow flex flex-col items-center justify-center p-3 sm:p-6">
                <h1 className="text-2xl sm:text-4xl font-bold text-blue-500 mb-4 sm:mb-8 text-center">
                    {user ? `Welcome, ${user.name}! 🎉` : "Loading..."}
                </h1>

                {/* Admission Status Card - if already submitted */}
                {hasSubmittedAdmission && submissionData && (
                    <div className="w-full max-w-4xl mb-4 sm:mb-8 px-2">
                        <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 rounded-lg shadow-md">
                            <div className="flex flex-col sm:flex-row sm:items-start">
                                <div className="flex-shrink-0 pt-0.5 hidden sm:block">
                                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="sm:ml-3 flex-grow">
                                    <h3 className="text-base sm:text-lg font-semibold text-green-800">
                                        Admission Application Submitted
                                    </h3>
                                    <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-green-700 space-y-1">
                                        <p>Your admission application <span className="font-bold">(Application No: {submissionData.applicationNo})</span> has been submitted successfully.</p>
                                        {submissionData.rollNo && (
                                            <p>Assigned Roll No: <span className="font-bold uppercase">{submissionData.rollNo}</span></p>
                                        )}
                                    </div>
                                    <div className="mt-2 sm:mt-3">
                                        <button
                                            onClick={() => navigate('/admission')}
                                            className="bg-green-700 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-green-800 transition"
                                        >
                                            View Application Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ✅ Menu Options as Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 px-2 sm:px-0 w-full max-w-4xl">
                    {/* Admission Card - change appearance if already submitted */}
                    <div
                        className={`bg-white p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition ${hasSubmittedAdmission ? 'border-2 border-green-500' : 'cursor-pointer'}`}
                        onClick={() => !hasSubmittedAdmission && navigate("/admission")}
                    >
                        <h2 className="text-xl font-bold text-purple-500 mb-2">📝 Admission Form</h2>
                        <p className="text-xs sm:text-sm text-gray-600">
                            {hasSubmittedAdmission 
                                ? 'Your admission application has been submitted.' 
                                : 'Fill out and submit your admission details.'}
                        </p>
                        {hasSubmittedAdmission && (
                            <div className="mt-3">
                                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                    {submissionData.status === 'approved' ? 'Approved' : 'Submitted'}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate("/view-admission-details");
                                    }}
                                    className="mt-2 block w-full px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded hover:bg-blue-200"
                                >
                                    View Details
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Circular Card */}
                    <div
                        className="bg-white p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition cursor-pointer"
                        onClick={() => navigate("/circular")}
                    >
                        <h2 className="text-xl font-bold text-green-500 mb-2">📢 Circular</h2>
                        <p className="text-xs sm:text-sm text-gray-600">View important announcements.</p>
                    </div>

                    {/* Pending Documents Card - Show only if user has pending documents */}
                    {hasPendingDocuments && (
                        <div
                            className="bg-white p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition cursor-pointer border-2 border-yellow-400"
                            onClick={() => navigate("/update-pending-documents")}
                        >
                            <h2 className="text-xl font-bold text-yellow-600 mb-2">📤 Update Documents</h2>
                            <p className="text-xs sm:text-sm text-gray-600">Upload your pending documents.</p>
                            <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                                Pending
                            </span>
                        </div>
                    )}

                    {/* Feedback Card */}
                    <div
                        className="bg-white p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition cursor-pointer"
                        onClick={() => navigate("/feedback")}
                    >
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">💬 Feedback</h2>
                        <p className="text-xs sm:text-sm text-gray-600">Share your feedback with us.</p>
                    </div>
                </div>
            </div>

            {/* ✅ Footer Section */}
            <footer className="bg-blue-600 text-white text-center py-4 sm:py-6 mt-6 sm:mt-10">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex flex-wrap justify-center space-x-2 sm:space-x-6 text-sm sm:text-lg font-semibold">
                        <a href="/privacy-policy" className="hover:underline transition mb-2">
                            📄 Privacy Policy
                        </a>
                        <a href="/terms" className="hover:underline transition mb-2">
                            📜 Terms
                        </a>
                        <a href="/contact" className="hover:underline transition mb-2">
                            📧 Contact
                        </a>
                        <a href="/about" className="hover:underline transition mb-2">
                            🔗 About
                        </a>
                    </div>
                    <p className="mt-2 sm:mt-4 text-xs sm:text-sm text-gray-200">
                        © {new Date().getFullYear()} AcadXpert. All rights reserved.
                    </p>
                </div>
            </footer>
            
        </div>
    );
}
