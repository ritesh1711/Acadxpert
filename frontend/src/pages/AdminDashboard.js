import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDashboard() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [activeTab, setActiveTab] = useState("details"); // 'details' or 'documents'
  const [searchTerm, setSearchTerm] = useState(""); // Add state for search term
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    
    if (!token || !isAdmin) {
      navigate("/admin/login");
      return;
    }
    
    // Fetch all admissions
    fetchAdmissions();
  }, [navigate]);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get("https://acadxpert8.onrender.com/admin/admissions", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setAdmissions(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching admissions:", err);
      setError("Failed to load admissions data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (admission) => {
    setSelectedAdmission(admission);
    setActiveTab("details");
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.patch(
        `https://acadxpert8.onrender.com/admin/admissions/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Update the admission status in the state
        setAdmissions(prevAdmissions =>
          prevAdmissions.map(admission =>
            admission._id === id ? { ...admission, status } : admission
          )
        );
        
        // Update selected admission if it's the one being modified
        if (selectedAdmission && selectedAdmission._id === id) {
          setSelectedAdmission({ ...selectedAdmission, status });
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    localStorage.removeItem("isAdmin");
    navigate("/admin/login");
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'approved':
        return "bg-green-100 text-green-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      default: // 'submitted'
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Helper to render document link or "Not submitted" if document doesn't exist
  const renderDocument = (docPath, label) => {
    if (!docPath) {
      return <span className="text-red-500 font-medium">Not submitted</span>;
    }
    
    const token = localStorage.getItem("token");
    const handleDownload = async () => {
      try {
        // Extract the filename from the path
        const filename = docPath.split('/').pop();
        
        // Try using the test route first
        const testUrl = `https://acadxpert8.onrender.com/test-file-access/${filename}`;
        console.log("Testing direct file access:", testUrl);
        
        try {
          // First try direct access without token
          const testResponse = await axios.get(testUrl, {
            responseType: 'blob'
          });
          
          // If the test succeeds, use the simple URL
          console.log("Direct file access successful!");
          
          // Create a blob URL for the file
          const blob = new Blob([testResponse.data]);
          const downloadUrl = window.URL.createObjectURL(blob);
          
          // Create a temporary link and click it to download the file
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
          return; // Exit if successful
        } catch (testErr) {
          console.log("Direct file access failed:", testErr.message);
          // Continue with the regular approach if test fails
        }
        
        // Regular approach with token
        const url = `https://acadxpert8.onrender.com/uploads/${filename}?token=${token}`;
        console.log("Attempting to download from:", url);
        
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: 'blob'
        });
        
        // Create a blob URL for the file
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        
        // Determine file extension based on content type
        let extension = '.pdf';
        const contentType = response.headers['content-type'];
        if (contentType) {
          if (contentType.includes('image/jpeg')) extension = '.jpg';
          else if (contentType.includes('image/png')) extension = '.png';
          else if (contentType.includes('image/')) extension = '.img';
        }
        
        // Create a temporary link and click it to download the file
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `${label.toLowerCase().replace(/\s+/g, '_')}${extension}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (err) {
        console.error("Error downloading document:", err);
        console.error("Document path attempted:", docPath);
        alert("Failed to download document. Please try again.");
      }
    };
    
    return (
      <button
        onClick={handleDownload}
        className="text-blue-600 hover:text-blue-800 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
        View {label}
      </button>
    );
  };

  // Helper function to get direct image URL
  const getImageUrl = (path) => {
    if (!path) return '';
    
    // Extract just the filename from the path
    const filename = path.split('/').pop();
    
    // Try the direct test route first, without token
    // This is more likely to work for images
    return `https://acadxpert8.onrender.com/test-file-access/${filename}`;
  };

  // Add this function to filter admissions based on search term
  const getFilteredAdmissions = () => {
    if (!searchTerm.trim()) return admissions;
    
    return admissions.filter(admission => {
      const name = (admission.nameEnglish || "").toLowerCase();
      const email = (admission.email || "").toLowerCase();
      const appNo = (admission.applicationNo || "").toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return name.includes(search) || 
             email.includes(search) || 
             appNo.includes(search);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => navigate("/admin/settings")}
                className="mr-4 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Student Admissions</h2>
            
            {/* Search Bar */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search by name, email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute right-3 top-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center">
              <div className="loader">Loading...</div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 pr-0 md:pr-4">
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {getFilteredAdmissions().length === 0 ? (
                      <li className="px-6 py-4 text-center text-gray-500">
                        {searchTerm ? 'No matching students found' : 'No admissions found'}
                      </li>
                    ) : (
                      getFilteredAdmissions().map((admission) => (
                        <li key={admission._id} className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {admission.nameEnglish || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                App No: {admission.applicationNo || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                Email: {admission.email || "N/A"}
                              </div>
                              <div className="mt-1">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(admission.status)}`}>
                                  {admission.status || "submitted"}
                                </span>
                              </div>
                            </div>
                            <div>
                              <button
                                onClick={() => handleViewDetails(admission)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
              
              <div className="w-full md:w-2/3 mt-6 md:mt-0">
                {selectedAdmission ? (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Application Details
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          Application #{selectedAdmission.applicationNo}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(selectedAdmission._id, "approved")}
                          className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedAdmission._id, "rejected")}
                          className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex">
                        <button
                          onClick={() => setActiveTab("details")}
                          className={`py-2 px-4 text-sm font-medium border-b-2 ${
                            activeTab === "details"
                              ? "border-blue-500 text-blue-600"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          Personal Details
                        </button>
                        <button
                          onClick={() => setActiveTab("documents")}
                          className={`py-2 px-4 text-sm font-medium border-b-2 ${
                            activeTab === "documents"
                              ? "border-blue-500 text-blue-600"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          Documents
                        </button>
                      </nav>
                    </div>
                    
                    {activeTab === "details" ? (
                      <div className="border-t border-gray-200">
                        <dl>
                          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Name</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {selectedAdmission.nameEnglish || "N/A"}
                            </dd>
                          </div>
                          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {selectedAdmission.email || "N/A"}
                            </dd>
                          </div>
                          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Mobile</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {selectedAdmission.mobileNumber || "N/A"}
                            </dd>
                          </div>
                          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Score</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {selectedAdmission.score || "N/A"}
                            </dd>
                          </div>
                          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Category</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {selectedAdmission.category || "N/A"}
                            </dd>
                          </div>
                          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Father's Name</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {selectedAdmission.fatherNameEnglish || "N/A"}
                            </dd>
                          </div>
                          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Mother's Name</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {selectedAdmission.motherNameEnglish || "N/A"}
                            </dd>
                          </div>
                          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(selectedAdmission.status)}`}>
                                {selectedAdmission.status || "submitted"}
                              </span>
                            </dd>
                          </div>
                        </dl>
                      </div>
                    ) : (
                      <div className="border-t border-gray-200 py-4">
                        <div className="mx-auto max-w-3xl">
                          <h4 className="text-lg font-medium text-gray-900 mb-6 px-4">Uploaded Documents</h4>
                          
                          <div className="border rounded-lg divide-y">
                            <div className="px-4 py-3 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Photo</span>
                              <span>
                                {selectedAdmission.photo ? (
                                  <div className="flex items-center">
                                    <img 
                                      src={getImageUrl(selectedAdmission.photo)}
                                      alt="Student Photo"
                                      className="h-12 w-12 mr-4 object-cover rounded"
                                      onError={(e) => {
                                        console.error("Failed to load image:", selectedAdmission.photo);
                                        e.target.onerror = null;
                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='12' text-anchor='middle' dominant-baseline='middle' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
                                      }}
                                    />
                                    {renderDocument(selectedAdmission.photo, "Photo")}
                                  </div>
                                ) : (
                                  <span className="text-red-500 font-medium">Not submitted</span>
                                )}
                              </span>
                            </div>
                            
                            <div className="px-4 py-3 flex items-center justify-between bg-gray-50">
                              <span className="text-sm font-medium text-gray-700">Signature</span>
                              <span>
                                {selectedAdmission.signature ? (
                                  <div className="flex items-center">
                                    <img 
                                      src={getImageUrl(selectedAdmission.signature)}
                                      alt="Signature"
                                      className="h-8 w-24 mr-4 object-contain border rounded"
                                      onError={(e) => {
                                        console.error("Failed to load image:", selectedAdmission.signature);
                                        e.target.onerror = null;
                                        // Using a data URI as fallback instead of external placeholder
                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='80' viewBox='0 0 240 80'%3E%3Crect width='240' height='80' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='12' text-anchor='middle' dominant-baseline='middle' fill='%23999'%3ENo Signature%3C/text%3E%3C/svg%3E";
                                      }}
                                    />
                                    {renderDocument(selectedAdmission.signature, "Signature")}
                                  </div>
                                ) : (
                                  <span className="text-red-500 font-medium">Not submitted</span>
                                )}
                              </span>
                            </div>
                            
                            <div className="px-4 py-3 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">10th Marksheet</span>
                              <span>{renderDocument(selectedAdmission.marksheet10th, "10th Marksheet")}</span>
                            </div>
                            
                            <div className="px-4 py-3 flex items-center justify-between bg-gray-50">
                              <span className="text-sm font-medium text-gray-700">12th Marksheet</span>
                              <span>{renderDocument(selectedAdmission.marksheet12th, "12th Marksheet")}</span>
                            </div>
                            
                            <div className="px-4 py-3 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Graduation Marksheet</span>
                              <span>{renderDocument(selectedAdmission.graduationMarksheet, "Graduation Marksheet")}</span>
                            </div>
                            
                            <div className="px-4 py-3 flex items-center justify-between bg-gray-50">
                              <span className="text-sm font-medium text-gray-700">Provisional Certificate</span>
                              <span>{renderDocument(selectedAdmission.provisionalCertificate, "Provisional Certificate")}</span>
                            </div>
                            
                            <div className="px-4 py-3 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Character Certificate</span>
                              <span>{renderDocument(selectedAdmission.characterCertificate, "Character Certificate")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white shadow sm:rounded-lg p-6 text-center text-gray-500">
                    Select an application to view details
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 