import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ViewAdmissionDetails() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [admissionData, setAdmissionData] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    const fetchAdmissionDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get('http://localhost:8000/admission/user/admission', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setAdmissionData(response.data.data);
        } else {
          setError("No admission data found. Please submit an admission form first.");
        }
      } catch (err) {
        console.error("Error fetching admission details:", err);
        setError("Error fetching your admission details. Please try again.");
        if (err.response && err.response.status === 404) {
          navigate("/admission");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdmissionDetails();
  }, [navigate]);

  // Format dates
  const formatDate = (dateObject) => {
    if (!dateObject) return "N/A";
    const { day, month, year } = dateObject;
    if (!day || !month || !year) return "N/A";
    return `${day}/${month}/${year}`;
  };

  // Show document status
  const getDocumentStatus = (docField) => {
    if (!admissionData) return "N/A";
    
    if (admissionData[docField]) {
      return <span className="text-green-600">Uploaded</span>;
    } else if (admissionData.documentStatus && admissionData.documentStatus[docField]) {
      if (admissionData.documentStatus[docField].pending) {
        return <span className="text-yellow-600">Pending</span>;
      } else if (admissionData.documentStatus[docField].notApplicable) {
        return <span className="text-gray-600">Not Applicable</span>;
      }
    }
    
    return <span className="text-red-600">Not Uploaded</span>;
  };

  // Get course name
  const getCourse = (code) => {
    const courses = {
      MCA: "Master of Computer Applications",
      MBA: "Master of Business Administration",
      MTech: "Master of Technology"
    };
    return courses[code] || code;
  };

  // Get semester name
  const getSemester = (num) => {
    const semesters = {
      1: "First Semester",
      2: "Second Semester",
      3: "Third Semester",
      4: "Fourth Semester"
    };
    return semesters[num] || `Semester ${num}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading your admission details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-gray-800">Error Loading Details</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => navigate("/home")}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!admissionData) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-gray-800">No Admission Data</h2>
            <p className="mt-2 text-gray-600">You haven't submitted an admission form yet.</p>
            <button
              onClick={() => navigate("/admission")}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit Admission Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-800">Centre for Development of Advanced Computing</h1>
          <p className="text-xs sm:text-sm">B-30, Institutional Area, Sector 62, Noida – 201 309</p>
          <h2 className="text-base sm:text-lg font-semibold text-blue-600 mt-2">
            {getCourse(admissionData.course)} ({getSemester(admissionData.semester)})
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Application Status Banner */}
        <div className={`w-full p-3 text-center text-white ${
          admissionData.status === 'approved' ? 'bg-green-600' : 
          admissionData.status === 'rejected' ? 'bg-red-600' : 'bg-blue-600'
        }`}>
          <span className="font-semibold">
            Application Status: {admissionData.status.charAt(0).toUpperCase() + admissionData.status.slice(1)}
          </span>
        </div>
        
        {/* Application Number */}
        <div className="p-4 sm:p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <span className="text-gray-500 text-sm">Application Number</span>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">{admissionData.applicationNo}</h3>
            </div>
            <div className="mt-2 sm:mt-0">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                Submitted on {new Date(admissionData.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="bg-gray-100 p-1 border-b flex overflow-x-auto">
          <button 
            className={`py-2 px-4 text-sm font-medium rounded-lg mr-1 ${activeTab === 'personal' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('personal')}
          >
            Personal Info
          </button>
          <button 
            className={`py-2 px-4 text-sm font-medium rounded-lg mr-1 ${activeTab === 'academic' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('academic')}
          >
            Academic
          </button>
          <button 
            className={`py-2 px-4 text-sm font-medium rounded-lg mr-1 ${activeTab === 'documents' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
          <button 
            className={`py-2 px-4 text-sm font-medium rounded-lg mr-1 ${activeTab === 'address' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('address')}
          >
            Address
          </button>
          {admissionData.undertakingText && (
            <button 
              className={`py-2 px-4 text-sm font-medium rounded-lg ${activeTab === 'undertaking' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('undertaking')}
            >
              Undertaking
            </button>
          )}
        </div>
        
        {/* Content Based on Active Tab */}
        <div className="p-4 sm:p-6">
          {/* Personal Information */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Personal Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-xs text-gray-500">Full Name (English)</span>
                  <p className="font-medium">{admissionData.nameEnglish || 'N/A'}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-xs text-gray-500">Full Name (Hindi)</span>
                  <p className="font-medium">{admissionData.nameHindi || 'N/A'}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-xs text-gray-500">Email Address</span>
                  <p className="font-medium">{admissionData.email || 'N/A'}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-xs text-gray-500">Mobile Number</span>
                  <p className="font-medium">{admissionData.mobileNumber || 'N/A'}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-xs text-gray-500">Date of Birth</span>
                  <p className="font-medium">{formatDate(admissionData.dateOfBirth)}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-xs text-gray-500">Category</span>
                  <p className="font-medium">{admissionData.category || 'N/A'}</p>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Parent Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Father's Information */}
                <div className="border p-3 rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-2">Father's Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Name</span>
                      <p className="text-sm">{admissionData.fatherNameEnglish || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Occupation</span>
                      <p className="text-sm">{admissionData.fatherOccupation || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Contact</span>
                      <p className="text-sm">{admissionData.fatherPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Mother's Information */}
                <div className="border p-3 rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-2">Mother's Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Name</span>
                      <p className="text-sm">{admissionData.motherNameEnglish || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Occupation</span>
                      <p className="text-sm">{admissionData.motherOccupation || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Contact</span>
                      <p className="text-sm">{admissionData.motherPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Academic Information */}
          {activeTab === 'academic' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Academic Information</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div>
                    <span className="text-xs text-blue-600 font-semibold">Program</span>
                    <p className="font-medium">{getCourse(admissionData.course)}</p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <span className="text-xs text-blue-600 font-semibold">Semester</span>
                    <p className="font-medium">{getSemester(admissionData.semester)}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {admissionData.nimcetRank && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-500">NIMCET Rank</span>
                    <p className="font-medium">{admissionData.nimcetRank}</p>
                  </div>
                )}
                
                {admissionData.catRank && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-500">CAT Rank</span>
                    <p className="font-medium">{admissionData.catRank}</p>
                  </div>
                )}
                
                {admissionData.gateRank && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-500">GATE Rank</span>
                    <p className="font-medium">{admissionData.gateRank}</p>
                  </div>
                )}
                
                {admissionData.score && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-500">Entrance Score</span>
                    <p className="font-medium">{admissionData.score}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Document Information */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Submitted Documents</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Required Documents */}
                <div className="border p-3 rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-2">Required Documents</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex justify-between">
                      <span>Photo</span>
                      {getDocumentStatus('photo')}
                    </li>
                    <li className="flex justify-between">
                      <span>Signature</span>
                      {getDocumentStatus('signature')}
                    </li>
                    <li className="flex justify-between">
                      <span>10th Marksheet</span>
                      {getDocumentStatus('marksheet10th')}
                    </li>
                    <li className="flex justify-between">
                      <span>12th Marksheet</span>
                      {getDocumentStatus('marksheet12th')}
                    </li>
                    <li className="flex justify-between">
                      <span>Graduation Marksheet</span>
                      {getDocumentStatus('graduationMarksheet')}
                    </li>
                  </ul>
                </div>
                
                {/* Other Documents */}
                <div className="border p-3 rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-2">Additional Documents</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex justify-between">
                      <span>Entrance Score Card</span>
                      {getDocumentStatus('entranceScoreCard')}
                    </li>
                    <li className="flex justify-between">
                      <span>Character Certificate</span>
                      {getDocumentStatus('characterCertificate')}
                    </li>
                    <li className="flex justify-between">
                      <span>Category Certificate</span>
                      {getDocumentStatus('categoryCertificate')}
                    </li>
                    <li className="flex justify-between">
                      <span>Aadhaar Card</span>
                      {getDocumentStatus('aadhaarCard')}
                    </li>
                    <li className="flex justify-between">
                      <span>PAN Card</span>
                      {getDocumentStatus('panCard')}
                    </li>
                  </ul>
                </div>
                
                {/* Pending Documents Note */}
                {Object.entries(admissionData.documentStatus || {}).some(([_, status]) => status.pending) && (
                  <div className="col-span-1 sm:col-span-2">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            You have pending documents. Please upload them as soon as possible.
                          </p>
                          <div className="mt-2">
                            <button 
                              onClick={() => navigate('/update-pending-documents')}
                              className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium hover:bg-yellow-200"
                            >
                              Upload Pending Documents
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Address Information */}
          {activeTab === 'address' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Address Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Permanent Address */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-2">Permanent Address</h4>
                  <p className="text-sm whitespace-pre-line">{admissionData.permanentAddress || 'N/A'}</p>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-gray-500">State</span>
                      <p className="text-sm">{admissionData.state || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">District</span>
                      <p className="text-sm">{admissionData.district || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">PIN Code</span>
                      <p className="text-sm">{admissionData.pinCode || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Correspondence Address */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-2">Correspondence Address</h4>
                  <p className="text-sm whitespace-pre-line">{admissionData.correspondenceAddress || 'Same as permanent address'}</p>
                  
                  <div className="mt-3">
                    <span className="text-xs text-gray-500">Email (For correspondence)</span>
                    <p className="text-sm">{admissionData.correspondenceEmail || admissionData.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Undertaking Information */}
          {activeTab === 'undertaking' && admissionData.undertakingText && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Undertaking for Pending Documents</h3>
              
              <div className="bg-yellow-50 border rounded-lg p-4">
                <p className="text-sm italic whitespace-pre-line">{admissionData.undertakingText}</p>
                
                <div className="mt-4">
                  <p className="text-xs text-gray-600">
                    This undertaking was submitted along with your application, agreeing to provide any pending documents 
                    within the stipulated time period. Your admission is provisional until all documents are submitted.
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <button 
                  onClick={() => navigate('/update-pending-documents')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                >
                  Upload Pending Documents
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="bg-gray-50 p-4 sm:p-6 border-t flex flex-col sm:flex-row justify-between gap-3">
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Back to Home
          </button>
          
          {Object.entries(admissionData.documentStatus || {}).some(([_, status]) => status.pending) && (
            <button
              onClick={() => navigate("/update-pending-documents")}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
            >
              Update Pending Documents
            </button>
          )}
          
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center justify-center"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Application
          </button>
        </div>
      </div>
    </div>
  );
} 