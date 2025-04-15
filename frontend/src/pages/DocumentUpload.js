import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function DocumentUpload() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState({
    photo: null,
    signature: null,
    marksheet10th: null,
    marksheet12th: null,
    graduationMarksheet: null,
    provisionalCertificate: null,
    characterCertificate: null
  });
  const [uploadStatus, setUploadStatus] = useState({});
  const [allUploaded, setAllUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

  // Check if user has already submitted a form
  useEffect(() => {
    const checkExistingSubmission = async () => {
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
          setHasSubmitted(true);
          setSubmissionData(response.data.data);
        }
      } catch (err) {
        // If we get a 404, it means the user hasn't submitted a form yet
        if (err.response && err.response.status === 404) {
          // Load form data from localStorage if user hasn't submitted yet
          const savedFormData = localStorage.getItem("admissionFormData");
          if (savedFormData) {
            setFormData(JSON.parse(savedFormData));
          } else {
            // If no form data is found, redirect back to admission form
            navigate("/admission");
          }
        } else {
          console.error("Error checking existing submission:", err);
          setError("Error checking your submission status. Please try again.");
        }
      }
    };

    checkExistingSubmission();
  }, [navigate]);

  const handleFileChange = (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is a PDF or image
      const fileType = file.type;
      const isPDF = fileType === 'application/pdf';
      const isImage = fileType.startsWith('image/');
      
      if (!isPDF && !isImage) {
        alert(`Please upload a PDF or image file for ${documentType}`);
        return;
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
      
      // Check if all documents are uploaded
      const updatedStatus = {
        ...uploadStatus,
        [documentType]: true
      };
      
      const allUploaded = Object.values(updatedStatus).every(status => status === true);
      setAllUploaded(allUploaded);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData) {
      setError("Form data not found. Please go back and fill the admission form first.");
      return;
    }
    
    // Check if required fields are present in formData
    const requiredFields = ['nameEnglish', 'email', 'mobileNumber', 'applicationNo'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`The following required fields are missing: ${missingFields.join(', ')}. Please go back and complete the form.`);
      return;
    }
    
    // Check if all required documents are uploaded
    const requiredDocuments = ['photo', 'signature'];
    const missingDocuments = requiredDocuments.filter(doc => !documents[doc]);
    
    if (missingDocuments.length > 0) {
      setError(`The following required documents are missing: ${missingDocuments.join(', ')}. Please upload all required documents.`);
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      // Get the token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to submit the form");
        return;
      }

      // Create FormData object to send files
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'dateOfBirth') {
          if (formData.dateOfBirth.day) formDataToSend.append('dateOfBirth[day]', formData.dateOfBirth.day);
          if (formData.dateOfBirth.month) formDataToSend.append('dateOfBirth[month]', formData.dateOfBirth.month);
          if (formData.dateOfBirth.year) formDataToSend.append('dateOfBirth[year]', formData.dateOfBirth.year);
        } else {
          if (formData[key]) formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add all files
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          formDataToSend.append(key, documents[key]);
        }
      });
      
      // Send data to backend
      const response = await axios.post(
        'http://localhost:8000/admission/submit',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Server response:', response.data);
      
      // Clear form data from localStorage
      localStorage.removeItem("admissionFormData");
      
      // Navigate to confirmation page
      navigate("/confirmation");
    } catch (err) {
      console.error("Error submitting documents:", err);
      
      // Create a more detailed error message
      let errorMessage = "Form submission failed: ";
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage += "\n" + err.response.data.errors.join("\n");
      } else {
        errorMessage += err.response?.data?.message || 
                       err.response?.data?.error || 
                       "An error occurred while submitting the documents. Please try again.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // If user has already submitted a form, show message and their submission details
  if (hasSubmitted && submissionData) {
    return (
      <div className="min-h-screen bg-gray-100 p-2 sm:p-6">
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-lg mb-4 sm:mb-6">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-800">Centre for Development of Advanced Computing</h1>
            <p className="text-sm sm:text-md">B-30, Institutional Area, Sector 62, Noida – 201 309</p>
            <h2 className="text-lg sm:text-xl font-semibold text-blue-600 mt-2">MCA Programme (1<sup>st</sup> Year - 1<sup>st</sup> Semester) 2024–2025</h2>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-8 rounded-lg shadow-lg">
          <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm sm:text-md text-green-700 font-medium">
                  You have already submitted an admission form.
                </p>
                <p className="text-xs sm:text-sm text-green-600 mt-1">
                  Your application has been submitted successfully.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-3 sm:mb-4">Application Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div className="border-b pb-2">
              <span className="font-semibold text-gray-600">Application No: </span>
              <span>{submissionData.applicationNo}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-semibold text-gray-600">Name: </span>
              <span>{submissionData.nameEnglish}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-semibold text-gray-600">Email: </span>
              <span className="break-all">{submissionData.email}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-semibold text-gray-600">Mobile: </span>
              <span>{submissionData.mobileNumber}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-semibold text-gray-600">Status: </span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                ${submissionData.status === 'approved' ? 'bg-green-100 text-green-800' : 
                 'bg-blue-100 text-blue-800'}`}>
                {submissionData.status === 'approved' ? 'Approved' : 'Submitted'}
              </span>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 flex justify-between">
            <button 
              onClick={() => navigate('/home')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If still loading or no form data is found, show loading message
  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <p className="text-gray-600 text-center">Loading... Please wait.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-6">
      <div className="bg-white p-3 sm:p-6 rounded-lg shadow-lg mb-4 sm:mb-10">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-800">Centre for Development of Advanced Computing</h1>
          <p className="text-sm sm:text-md">B-30, Institutional Area, Sector 62, Noida – 201 309</p>
          <h2 className="text-lg sm:text-xl font-semibold text-blue-600 mt-2">MCA Programme (1<sup>st</sup> Year - 1<sup>st</sup> Semester) 2024–2025</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-8 rounded-lg shadow-lg space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-2 sm:mb-4">Document Upload</h2>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-6">Please upload the following documents in PDF or image format.</p>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Photo Upload */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">1. Recent Photograph</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload a recent passport-sized photograph (JPG/PNG)</p>
            <div className="flex items-center flex-wrap">
              <input
                type="file"
                id="photo"
                onChange={(e) => handleFileChange(e, 'photo')}
                className="block w-full text-xs sm:text-sm text-gray-500
                  file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept="image/*"
              />
              {uploadStatus.photo && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </div>
          </div>

          {/* Signature Upload */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">2. Signature</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload your signature (JPG/PNG)</p>
            <div className="flex items-center flex-wrap">
              <input
                type="file"
                id="signature"
                onChange={(e) => handleFileChange(e, 'signature')}
                className="block w-full text-xs sm:text-sm text-gray-500
                  file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept="image/*"
              />
              {uploadStatus.signature && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </div>
          </div>

          {/* 10th Marksheet Upload */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">3. 10th Marksheet</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload your 10th standard marksheet (PDF)</p>
            <div className="flex items-center flex-wrap">
              <input
                type="file"
                id="marksheet10th"
                onChange={(e) => handleFileChange(e, 'marksheet10th')}
                className="block w-full text-xs sm:text-sm text-gray-500
                  file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept=".pdf"
              />
              {uploadStatus.marksheet10th && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </div>
          </div>

          {/* 12th Marksheet Upload */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">4. 12th Marksheet</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload your 12th standard marksheet (PDF)</p>
            <div className="flex items-center flex-wrap">
              <input
                type="file"
                id="marksheet12th"
                onChange={(e) => handleFileChange(e, 'marksheet12th')}
                className="block w-full text-xs sm:text-sm text-gray-500
                  file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept=".pdf"
              />
              {uploadStatus.marksheet12th && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </div>
          </div>

          {/* Graduation Marksheet Upload */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">5. Graduation Marksheet</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload your graduation marksheet (PDF)</p>
            <div className="flex items-center flex-wrap">
              <input
                type="file"
                id="graduationMarksheet"
                onChange={(e) => handleFileChange(e, 'graduationMarksheet')}
                className="block w-full text-xs sm:text-sm text-gray-500
                  file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept=".pdf"
              />
              {uploadStatus.graduationMarksheet && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </div>
          </div>

          {/* Provisional Certificate Upload */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">6. Provisional Certificate</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload your provisional certificate (PDF)</p>
            <div className="flex items-center flex-wrap">
              <input
                type="file"
                id="provisionalCertificate"
                onChange={(e) => handleFileChange(e, 'provisionalCertificate')}
                className="block w-full text-xs sm:text-sm text-gray-500
                  file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept=".pdf"
              />
              {uploadStatus.provisionalCertificate && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </div>
          </div>

          {/* Character Certificate Upload */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">7. Character Certificate</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload your character certificate (PDF)</p>
            <div className="flex items-center flex-wrap">
              <input
                type="file"
                id="characterCertificate"
                onChange={(e) => handleFileChange(e, 'characterCertificate')}
                className="block w-full text-xs sm:text-sm text-gray-500
                  file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept=".pdf"
              />
              {uploadStatus.characterCertificate && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 p-3 sm:p-4 rounded-lg mt-4">
            <p className="font-semibold text-sm">Form Submission Error:</p>
            <div className="mt-2 whitespace-pre-line text-xs sm:text-sm">{error}</div>
          </div>
        )}

        <div className="text-right pt-4 sm:pt-6">
          <button
            type="submit"
            className={`font-semibold px-4 sm:px-6 py-1.5 sm:py-2 rounded text-xs sm:text-sm ${
              !loading
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
} 