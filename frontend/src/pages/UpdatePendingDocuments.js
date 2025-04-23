import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function UpdatePendingDocuments() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState({});
  const [documentStatus, setDocumentStatus] = useState({});
  const [pendingDocFields, setPendingDocFields] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [submissionData, setSubmissionData] = useState(null);
  const [success, setSuccess] = useState("");

  // Fetch user's admission details
  useEffect(() => {
    const fetchAdmissionDetails = async () => {
      try {
        setFetching(true);
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
          setSubmissionData(response.data.data);
          
          // Extract document status from response
          if (response.data.data.documentStatus) {
            setDocumentStatus(response.data.data.documentStatus);
            
            // Get list of pending document fields
            const pendingFields = [];
            Object.entries(response.data.data.documentStatus).forEach(([field, status]) => {
              if (status.pending) {
                pendingFields.push(field);
              }
            });
            setPendingDocFields(pendingFields);
          }
        } else {
          setError("No admission data found.");
        }
      } catch (err) {
        console.error("Error fetching admission details:", err);
        setError("Error fetching your admission details. Please try again.");
        if (err.response && err.response.status === 404) {
          navigate("/admission");
        }
      } finally {
        setFetching(false);
      }
    };

    fetchAdmissionDetails();
  }, [navigate]);

  // Handle file upload
  const handleFileChange = (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is a PDF or image
      const fileType = file.type;
      const isPDF = fileType === 'application/pdf';
      const isImage = fileType.startsWith('image/');
      
      if (documentType === 'photo' || documentType === 'signature') {
        if (!isImage) {
          alert(`Please upload an image file for ${documentType}`);
          return;
        }
      } else {
        if (!isPDF) {
          alert(`Please upload a PDF file for ${documentType}`);
          return;
        }
      }
      
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        alert(`File size for ${documentType} is too large. Maximum size is 10MB.`);
        return;
      }
      
      setDocuments(prev => ({
        ...prev,
        [documentType]: file
      }));
      
      setUploadStatus(prev => ({
        ...prev,
        [documentType]: true
      }));
    }
  };

  // Handle document update submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if any files are selected for upload
    if (Object.keys(documents).length === 0) {
      setError("Please select at least one document to upload.");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      // Get the token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to update documents");
        return;
      }

      // Create FormData object to send files
      const formDataToSend = new FormData();
      
      // Add all files
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          formDataToSend.append(key, documents[key]);
        }
      });
      
      // Send data to backend
      const response = await axios.post(
        'http://localhost:8000/admission/update-pending-documents',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Server response:', response.data);
      
      if (response.data.success) {
        setSuccess("Your pending documents have been successfully updated!");
        setSubmissionData(response.data.data);
        
        // Update the pending document fields
        if (response.data.data.documentStatus) {
          setDocumentStatus(response.data.data.documentStatus);
          
          // Get updated list of pending document fields
          const pendingFields = [];
          Object.entries(response.data.data.documentStatus).forEach(([field, status]) => {
            if (status.pending) {
              pendingFields.push(field);
            }
          });
          setPendingDocFields(pendingFields);
        }
        
        // Clear documents state
        setDocuments({});
        setUploadStatus({});
      }
    } catch (err) {
      console.error("Error updating documents:", err);
      setError(err.response?.data?.message || "Error updating documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Prettify document field names
  const getPrettyFieldName = (field) => {
    const nameMap = {
      photo: "Photograph",
      signature: "Signature",
      marksheet10th: "10th Marksheet",
      certificate10th: "10th Certificate",
      marksheet12th: "12th Marksheet",
      certificate12th: "12th Certificate",
      graduationMarksheet: "Graduation Marksheet",
      semester1: "Semester 1 Marksheet",
      semester2: "Semester 2 Marksheet",
      semester3: "Semester 3 Marksheet",
      semester4: "Semester 4 Marksheet",
      semester5: "Semester 5 Marksheet",
      semester6: "Semester 6 Marksheet",
      semester7: "Semester 7 Marksheet",
      semester8: "Semester 8 Marksheet",
      entranceAdmitCard: "Entrance Exam Admit Card",
      entranceScoreCard: "Entrance Exam Score Card",
      provisionalCertificate: "Provisional Certificate",
      characterCertificate: "Character Certificate",
      provisionalAdmissionSlip: "Provisional Admission Slip",
      paymentSlip: "Payment Slip",
      studyCentreProof: "Study Centre Proof",
      medicalCertificate: "Medical Certificate",
      categoryCertificate: "Category Certificate",
      defenceCertificate: "Defence Certificate",
      aadhaarCard: "Aadhaar Card",
      panCard: "PAN Card"
    };
    
    return nameMap[field] || field;
  };

  // Loading state
  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <p className="text-center text-gray-600">Loading your admission details...</p>
        </div>
      </div>
    );
  }

  // No pending documents
  if (pendingDocFields.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Update Pending Documents</h2>
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-green-700">You don't have any pending documents to update.</p>
          </div>
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => navigate("/home")}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-blue-800 mb-1">Update Pending Documents</h2>
        <p className="text-sm text-gray-600 mb-4">Upload your pending documents to complete your admission</p>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-green-700">{success}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {pendingDocFields.map((field) => (
              <div key={field} className="border p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">{getPrettyFieldName(field)}</h3>
                <div className="flex items-center flex-wrap">
                  <input
                    type="file"
                    id={field}
                    onChange={(e) => handleFileChange(e, field)}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                    accept={field === 'photo' || field === 'signature' ? "image/*" : ".pdf"}
                  />
                  {uploadStatus[field] && (
                    <span className="ml-2 text-green-500">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className={`px-6 py-2 rounded font-medium ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Update Documents"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 