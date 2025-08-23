import React, { useEffect, useState } from "react";

export default function StudentProfile() {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        studentId: "",
        fatherName: "",
        motherName: "",
        phone: "",
        address: ""
    });

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await fetch("http://localhost:8000/auth/user", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                
                if (!response.ok) throw new Error("Failed to fetch user");
                const data = await response.json();
                setUser(data);
                setFormData({ ...formData, name: data.name, email: data.email });
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };

        fetchUser();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        console.log("Updated profile:", formData);
        setIsEditing(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
            <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Student Profile</h2>
                
                <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <span className="text-gray-700 font-medium">Full Name:</span>
                        {isEditing ? (
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                        ) : (
                            <p className="text-gray-800 font-semibold">{formData.name || "-"}</p>
                        )}
                    </div>
                    
                    {/* Email */}
                    <div>
                        <span className="text-gray-700 font-medium">Email:</span>
                        <p className="text-gray-800 font-semibold">{formData.email}</p>
                    </div>

                    {/* Student ID */}
                    <div>
                        <span className="text-gray-700 font-medium">Student ID:</span>
                        {isEditing ? (
                            <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                        ) : (
                            <p className="text-gray-800 font-semibold">{formData.studentId || "-"}</p>
                        )}
                    </div>
                    
                    {/* Father's Name */}
                    <div>
                        <span className="text-gray-700 font-medium">Father's Name:</span>
                        {isEditing ? (
                            <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                        ) : (
                            <p className="text-gray-800 font-semibold">{formData.fatherName || "-"}</p>
                        )}
                    </div>
                    
                    {/* Mother's Name */}
                    <div>
                        <span className="text-gray-700 font-medium">Mother's Name:</span>
                        {isEditing ? (
                            <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                        ) : (
                            <p className="text-gray-800 font-semibold">{formData.motherName || "-"}</p>
                        )}
                    </div>
                    
                    {/* Phone Number */}
                    <div>
                        <span className="text-gray-700 font-medium">Phone:</span>
                        {isEditing ? (
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                        ) : (
                            <p className="text-gray-800 font-semibold">{formData.phone || "-"}</p>
                        )}
                    </div>
                    
                    {/* Address */}
                    <div>
                        <span className="text-gray-700 font-medium">Address:</span>
                        {isEditing ? (
                            <textarea name="address" value={formData.address} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg resize-none" />
                        ) : (
                            <p className="text-gray-800 font-semibold">{formData.address || "-"}</p>
                        )}
                    </div>
                </div>
                
                {/* Buttons */}
                <div className="mt-6 flex justify-between">
                    {isEditing ? (
                        <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600">Save</button>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600">Edit</button>
                    )}
                </div>
            </div>
        </div>
    );
}
