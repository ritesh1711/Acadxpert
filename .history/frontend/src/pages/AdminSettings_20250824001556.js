import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminSettings() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    newUsername: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate passwords match if changing password
    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    // Validate at least one field is being updated
    if (!formData.newPassword && !formData.newUsername) {
      setError("Please provide a new password or username to update");
      setLoading(false);
      return;
    }

    // Require current password
    if (!formData.currentPassword) {
      setError("Current password is required");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const payload = {
        currentPassword: formData.currentPassword
      };

      if (formData.newPassword) {
        payload.newPassword = formData.newPassword;
      }

      if (formData.newUsername) {
        payload.newUsername = formData.newUsername;
      }

      const response = await axios.post(
        "http://localhost:8000/admin/update-credentials",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setSuccess("Admin credentials updated successfully");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
          newUsername: ""
        });

        if (formData.newUsername) {
          localStorage.setItem("username", formData.newUsername);
        }
      }
    } catch (err) {
      console.error("Error updating credentials:", err);
      setError(err.response?.data?.message || "Failed to update credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Admin Settings</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="mr-4 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("username");
                  localStorage.removeItem("name");
                  localStorage.removeItem("isAdmin");
                  navigate("/admin/login");
                }}
                className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Change Admin Credentials
            </h2>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className="mb-4 text-sm text-gray-500">
                  Current admin username: {localStorage.getItem("username")}
                </p>
              </div>

              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmNewPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    type="password"
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="newUsername"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Username
                </label>
                <input
                  id="newUsername"
                  name="newUsername"
                  type="text"
                  value={formData.newUsername}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? "Updating..." : "Update Credentials"}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-700">
                  <strong>Important:</strong> If you update your username or password,
                  you will need to use the new credentials for future logins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
