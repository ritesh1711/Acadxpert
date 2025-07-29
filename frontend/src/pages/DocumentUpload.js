import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function DocumentUpload() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState({
    // Required documents
    photo: null,
    signature: null,
    
    // Educational documents
    marksheet10th: null,
    certificate10th: null,
    marksheet12th: null,
    certificate12th: null,
    graduationMarksheet: null,
    
    // Semester marksheets
    semester1: null,
    semester2: null,
    semester3: null,
    semester4: null,
    semester5: null,
    semester6: null,
    semester7: null,
    semester8: null,
    
    // Entrance exam documents
    entranceAdmitCard: null,
    entranceScoreCard: null,
    
    // Other documents
    provisionalCertificate: null,
    characterCertificate: null,
    provisionalAdmissionSlip: null,
    paymentSlip: null,
    studyCentreProof: null,
    medicalCertificate: null,
    categoryCertificate: null,
    defenceCertificate: null,
    aadhaarCard: null,
    panCard: null
  });
  const [uploadStatus, setUploadStatus] = useState({});
  const [documentStatus, setDocumentStatus] = useState({
    // Semester marksheets
    semester1: { pending: false, notApplicable: false },
    semester2: { pending: false, notApplicable: false },
    semester3: { pending: false, notApplicable: false },
    semester4: { pending: false, notApplicable: false },
    semester5: { pending: false, notApplicable: false },
    semester6: { pending: false, notApplicable: false },
    semester7: { pending: false, notApplicable: false },
    semester8: { pending: false, notApplicable: false },
    
    // Entrance exam documents
    entranceAdmitCard: { pending: false, notApplicable: false },
    entranceScoreCard: { pending: false, notApplicable: false },
    
    // Other documents
    provisionalCertificate: { pending: false, notApplicable: false },
    characterCertificate: { pending: false, notApplicable: false },
    provisionalAdmissionSlip: { pending: false, notApplicable: false },
    paymentSlip: { pending: false, notApplicable: false },
    studyCentreProof: { pending: false, notApplicable: false },
    medicalCertificate: { pending: false, notApplicable: false },
    categoryCertificate: { pending: false, notApplicable: false },
    defenceCertificate: { pending: false, notApplicable: false },
    graduationMarksheet: { pending: false, notApplicable: false },
  });
  const [undertakingText, setUndertakingText] = useState("");
  const [hasPendingDocuments, setHasPendingDocuments] = useState(false);
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

  // Get the current course from localStorage
  const course = localStorage.getItem("course") || "MCA";

  // Get required documents based on course
  const getRequiredDocuments = () => {
    const baseRequired = ['photo', 'signature'];
    
    switch(course) {
      case 'MBA':
        return [...baseRequired];
      case 'MTech':
        return [...baseRequired];
      case 'MCA':
      default:
        return [...baseRequired, 'characterCertificate'];
    }
  };

  // Get entrance exam label based on course
  const getEntranceExamLabel = () => {
    switch(course) {
      case 'MBA': return "CAT/CET Score Card";
      case 'MTech': return "GATE/CET Score Card";
      case 'MCA':
      default: return "NIMCET/CET Score Card";
    }
  };

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
      
      // If a file is uploaded, reset the pending and notApplicable status
      if (documentStatus[documentType]) {
        setDocumentStatus(prev => ({
          ...prev,
          [documentType]: { pending: false, notApplicable: false }
        }));
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

  // Handle toggle of pending status
  const handlePendingChange = (documentType) => {
    const currentStatus = documentStatus[documentType];
    
    if (!currentStatus) return;
    
    // Cannot be both pending and not applicable
    const newPendingValue = !currentStatus.pending;
    const newNotApplicableValue = newPendingValue ? false : currentStatus.notApplicable;
    
    setDocumentStatus(prev => ({
      ...prev,
      [documentType]: { 
        pending: newPendingValue, 
        notApplicable: newNotApplicableValue 
      }
    }));
    
    // If marked as pending, remove any uploaded file
    if (newPendingValue) {
      setDocuments(prev => ({
        ...prev,
        [documentType]: null
      }));
      
      setUploadStatus(prev => ({
        ...prev,
        [documentType]: false
      }));
    }
    
    // Check if any documents are now pending
    setTimeout(() => {
      checkForPendingDocuments();
    }, 0);
  };
  
  // Handle toggle of not applicable status
  const handleNotApplicableChange = (documentType) => {
    const currentStatus = documentStatus[documentType];
    
    if (!currentStatus) return;
    
    // Cannot be both pending and not applicable
    const newNotApplicableValue = !currentStatus.notApplicable;
    const newPendingValue = newNotApplicableValue ? false : currentStatus.pending;
    
    setDocumentStatus(prev => ({
      ...prev,
      [documentType]: { 
        pending: newPendingValue, 
        notApplicable: newNotApplicableValue 
      }
    }));
    
    // If marked as not applicable, remove any uploaded file
    if (newNotApplicableValue) {
      setDocuments(prev => ({
        ...prev,
        [documentType]: null
      }));
      
      setUploadStatus(prev => ({
        ...prev,
        [documentType]: false
      }));
    }
    
    // Check if any documents are still pending
    setTimeout(() => {
      checkForPendingDocuments();
    }, 0);
  };
  
  // Check if any documents are marked as pending
  const checkForPendingDocuments = () => {
    const hasPending = Object.values(documentStatus).some(status => status.pending);
    setHasPendingDocuments(hasPending);
  };
  
  // Handle undertaking text change
  const handleUndertakingChange = (e) => {
    setUndertakingText(e.target.value);
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
    const requiredDocuments = getRequiredDocuments();
    const missingDocuments = requiredDocuments.filter(doc => !documents[doc]);
    
    if (missingDocuments.length > 0) {
      setError(`The following required documents are missing: ${missingDocuments.join(', ')}. Please upload all required documents.`);
      return;
    }
    
    // Check if undertaking is provided for pending documents
    if (hasPendingDocuments && !undertakingText.trim()) {
      setError("Please provide an undertaking for the pending documents.");
      return;
    }
    
    // Check if any uploaded files exceed the size limit (10MB)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = Object.entries(documents)
      .filter(([_, file]) => file && file.size > maxSizeInBytes)
      .map(([key, _]) => key);
    
    if (oversizedFiles.length > 0) {
      setError(`The following files exceed the maximum size limit of 10MB: ${oversizedFiles.join(', ')}. Please compress or resize these files.`);
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      // Get the token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to submit the form");
        setLoading(false);
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
      
      // Add all files with progress tracking
      const totalFiles = Object.values(documents).filter(Boolean).length;
      let filesProcessed = 0;
      
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          console.log(`Adding file ${key}: ${documents[key].name}, ${Math.round(documents[key].size / 1024)} KB`);
          formDataToSend.append(key, documents[key]);
          filesProcessed++;
        }
      });
      
      console.log(`Processed ${filesProcessed} of ${totalFiles} files`);
      
      // Add document status data
      formDataToSend.append('documentStatus', JSON.stringify(documentStatus));
      
      // Add undertaking text if there are pending documents
      if (hasPendingDocuments) {
        formDataToSend.append('undertakingText', undertakingText);
      }
      
      // Send data to backend with timeout and retry
      const maxRetries = 2;
      let currentRetry = 0;
      let success = false;
      
      while (currentRetry <= maxRetries && !success) {
        try {
          if (currentRetry > 0) {
            console.log(`Retry attempt ${currentRetry}/${maxRetries}`);
          }
          
          const response = await axios.post(
            'http://localhost:8000/admission/submit',
            formDataToSend,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
              },
              timeout: 60000, // 60 seconds timeout
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`Upload progress: ${percentCompleted}%`);
              }
            }
          );
          
          console.log('Server response:', response.data);
          success = true;
          
          // Clear form data from localStorage
          localStorage.removeItem("admissionFormData");
          
          // Navigate to confirmation page
          navigate("/confirmation");
          return;
        } catch (retryErr) {
          console.error(`Attempt ${currentRetry + 1} failed:`, retryErr);
          currentRetry++;
          
          // If this was the last retry, throw the error to be caught by the outer catch
          if (currentRetry > maxRetries) {
            throw retryErr;
          }
          
          // Wait before retrying (increasing delay for each retry)
          await new Promise(resolve => setTimeout(resolve, 2000 * currentRetry));
        }
      }
    } catch (err) {
      console.error("Error submitting documents:", err);
      
      // Create a more detailed error message based on the type of error
      let errorMessage = "Form submission failed: ";
      
      if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        errorMessage = "The request timed out. This might be due to large file sizes or slow connection. Please try again or compress your files.";
      } else if (err.response) {
        // The server responded with a status code outside the 2xx range
        if (err.response.status === 413) {
          errorMessage = "The files you are trying to upload are too large. Please compress or resize your files.";
        } else if (err.response.status === 400) {
          // Validation errors
          if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
            errorMessage += "\n" + err.response.data.errors.join("\n");
          } else {
            errorMessage += err.response.data.message || "Invalid form data. Please check your inputs.";
          }
        } else if (err.response.status === 401) {
          errorMessage = "Your session has expired. Please log in again.";
          // Clear token and redirect to login
          localStorage.removeItem("token");
          navigate("/login");
        } else if (err.response.status === 500) {
          errorMessage = "Server error: " + (err.response.data.error || "An unexpected error occurred on the server.");
        } else {
          errorMessage += err.response.data.message || 
                         err.response.data.error || 
                         `Server returned status code ${err.response.status}`;
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your internet connection and try again.";
      } else {
        // Something happened in setting up the request
        errorMessage += err.message || "An unexpected error occurred while preparing the request.";
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
          <h2 className="text-lg sm:text-xl font-semibold text-blue-600 mt-2">{course} Programme (1<sup>st</sup> Year - 1<sup>st</sup> Semester) 2024–2025</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-8 rounded-lg shadow-lg space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-2 sm:mb-4">Document Upload</h2>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-6">Please upload the following documents in PDF or image format.</p>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Required Documents - These will be shown for all courses */}
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

          {/* 10th Certificate Upload */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">4. 10th Certificate</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload your 10th standard certificate (PDF)</p>
            <div className="flex items-center flex-wrap">
              <input
                type="file"
                id="certificate10th"
                onChange={(e) => handleFileChange(e, 'certificate10th')}
                className="block w-full text-xs sm:text-sm text-gray-500
                  file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept=".pdf"
              />
              {uploadStatus.certificate10th && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </div>
          </div>

          {/* 12th Marksheet Upload */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">5. 12th Marksheet</h3>
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

          {/* 12th Certificate Upload */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">6. 12th Certificate</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload your 12th standard certificate (PDF)</p>
            <div className="flex items-center flex-wrap">
              <input
                type="file"
                id="certificate12th"
                onChange={(e) => handleFileChange(e, 'certificate12th')}
                className="block w-full text-xs sm:text-sm text-gray-500
                  file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept=".pdf"
              />
              {uploadStatus.certificate12th && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </div>
          </div>

          {/* Graduation Marksheet Upload */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">7. Graduation Marksheet</h3>
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
                disabled={documentStatus.graduationMarksheet?.pending || documentStatus.graduationMarksheet?.notApplicable}
              />
              {uploadStatus.graduationMarksheet && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </div>
            
            <div className="mt-2 flex items-center space-x-4">
              <label className="inline-flex items-center text-xs sm:text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="form-checkbox h-3 w-3 sm:h-4 sm:w-4 text-blue-600"
                  checked={documentStatus.graduationMarksheet?.pending || false}
                  onChange={() => handlePendingChange('graduationMarksheet')}
                  disabled={documentStatus.graduationMarksheet?.notApplicable}
                />
                <span className="ml-1">Pending</span>
              </label>
              
              <label className="inline-flex items-center text-xs sm:text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="form-checkbox h-3 w-3 sm:h-4 sm:w-4 text-blue-600"
                  checked={documentStatus.graduationMarksheet?.notApplicable || false}
                  onChange={() => handleNotApplicableChange('graduationMarksheet')}
                  disabled={documentStatus.graduationMarksheet?.pending}
                />
                <span className="ml-1">Not Applicable</span>
              </label>
            </div>
          </div>

          {/* Entrance Exam Score Card - Course-specific label */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">8. {getEntranceExamLabel()}</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload your entrance exam score card (PDF)</p>
            <div className="flex items-center flex-wrap">
              <input
                type="file"
                id="entranceScoreCard"
                onChange={(e) => handleFileChange(e, 'entranceScoreCard')}
                className="block w-full text-xs sm:text-sm text-gray-500
                  file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept=".pdf"
              />
              {uploadStatus.entranceScoreCard && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </div>
          </div>

          {/* Provisional Certificate Upload */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">9. Provisional Certificate</h3>
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
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">10. Character Certificate</h3>
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

          {/* Additional Category Certificate - Show for MBA and MTech */}
          {(course === 'MBA' || course === 'MTech') && (
            <div className="border p-3 sm:p-4 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">11. Category Certificate</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload your category certificate (PDF)</p>
              <div className="flex items-center flex-wrap">
                <input
                  type="file"
                  id="categoryCertificate"
                  onChange={(e) => handleFileChange(e, 'categoryCertificate')}
                  className="block w-full text-xs sm:text-sm text-gray-500
                    file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  accept=".pdf"
                />
                {uploadStatus.categoryCertificate && (
                  <span className="ml-2 text-green-500">✓</span>
                )}
              </div>
            </div>
          )}

          {/* Aadhaar Card Upload - Optional but useful */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">{(course === 'MBA' || course === 'MTech') ? '12' : '11'}. Aadhaar Card</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload your Aadhaar card (PDF)</p>
            <div className="flex items-center flex-wrap">
              <input
                type="file"
                id="aadhaarCard"
                onChange={(e) => handleFileChange(e, 'aadhaarCard')}
                className="block w-full text-xs sm:text-sm text-gray-500
                  file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept=".pdf"
              />
              {uploadStatus.aadhaarCard && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </div>
          </div>

          {/* PAN Card Upload */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">{(course === 'MBA' || course === 'MTech') ? '13' : '12'}. PAN Card</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload your PAN card (PDF)</p>
            <div className="flex items-center flex-wrap">
              <input
                type="file"
                id="panCard"
                onChange={(e) => handleFileChange(e, 'panCard')}
                className="block w-full text-xs sm:text-sm text-gray-500
                  file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept=".pdf"
              />
              {uploadStatus.panCard && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </div>
          </div>

          {/* Entrance Admit Card */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">{(course === 'MBA' || course === 'MTech') ? '14' : '13'}. Entrance Admit Card</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload your entrance exam admit card (PDF)</p>
            <div className="flex items-center flex-wrap">
              <input
                type="file"
                id="entranceAdmitCard"
                onChange={(e) => handleFileChange(e, 'entranceAdmitCard')}
                className="block w-full text-xs sm:text-sm text-gray-500
                  file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept=".pdf"
              />
              {uploadStatus.entranceAdmitCard && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </div>
          </div>

          {/* Semester Marksheets */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">{(course === 'MBA' || course === 'MTech') ? '15' : '14'}. Semester Marksheets</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload semester marksheets (PDF)</p>
            
            {/* Semester 1 */}
            <div className="my-2">
              <p className="text-xs text-gray-600 mb-1">Semester 1</p>
              <div className="flex items-center flex-wrap">
                <input
                  type="file"
                  id="semester1"
                  onChange={(e) => handleFileChange(e, 'semester1')}
                  className="block w-full text-xs sm:text-sm text-gray-500
                    file:mr-2 file:py-1 file:px-2
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  accept=".pdf"
                  disabled={documentStatus.semester1?.pending || documentStatus.semester1?.notApplicable}
                />
                {uploadStatus.semester1 && (
                  <span className="ml-2 text-green-500">✓</span>
                )}
              </div>
              <div className="mt-1 flex items-center space-x-4">
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.semester1?.pending || false}
                    onChange={() => handlePendingChange('semester1')}
                    disabled={documentStatus.semester1?.notApplicable}
                  />
                  <span className="ml-1">Pending</span>
                </label>
                
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.semester1?.notApplicable || false}
                    onChange={() => handleNotApplicableChange('semester1')}
                    disabled={documentStatus.semester1?.pending}
                  />
                  <span className="ml-1">Not Applicable</span>
                </label>
              </div>
            </div>
            
            {/* Semester 2 */}
            <div className="my-2">
              <p className="text-xs text-gray-600 mb-1">Semester 2</p>
              <div className="flex items-center flex-wrap">
                <input
                  type="file"
                  id="semester2"
                  onChange={(e) => handleFileChange(e, 'semester2')}
                  className="block w-full text-xs sm:text-sm text-gray-500
                    file:mr-2 file:py-1 file:px-2
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  accept=".pdf"
                  disabled={documentStatus.semester2?.pending || documentStatus.semester2?.notApplicable}
                />
                {uploadStatus.semester2 && (
                  <span className="ml-2 text-green-500">✓</span>
                )}
              </div>
              <div className="mt-1 flex items-center space-x-4">
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.semester2?.pending || false}
                    onChange={() => handlePendingChange('semester2')}
                    disabled={documentStatus.semester2?.notApplicable}
                  />
                  <span className="ml-1">Pending</span>
                </label>
                
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.semester2?.notApplicable || false}
                    onChange={() => handleNotApplicableChange('semester2')}
                    disabled={documentStatus.semester2?.pending}
                  />
                  <span className="ml-1">Not Applicable</span>
                </label>
              </div>
            </div>
            
            {/* Semester 3 */}
            <div className="my-2">
              <p className="text-xs text-gray-600 mb-1">Semester 3</p>
              <div className="flex items-center flex-wrap">
                <input
                  type="file"
                  id="semester3"
                  onChange={(e) => handleFileChange(e, 'semester3')}
                  className="block w-full text-xs sm:text-sm text-gray-500
                    file:mr-2 file:py-1 file:px-2
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  accept=".pdf"
                  disabled={documentStatus.semester3?.pending || documentStatus.semester3?.notApplicable}
                />
                {uploadStatus.semester3 && (
                  <span className="ml-2 text-green-500">✓</span>
                )}
              </div>
              <div className="mt-1 flex items-center space-x-4">
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.semester3?.pending || false}
                    onChange={() => handlePendingChange('semester3')}
                    disabled={documentStatus.semester3?.notApplicable}
                  />
                  <span className="ml-1">Pending</span>
                </label>
                
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.semester3?.notApplicable || false}
                    onChange={() => handleNotApplicableChange('semester3')}
                    disabled={documentStatus.semester3?.pending}
                  />
                  <span className="ml-1">Not Applicable</span>
                </label>
              </div>
            </div>
            
            {/* Semester 4 */}
            <div className="my-2">
              <p className="text-xs text-gray-600 mb-1">Semester 4</p>
              <div className="flex items-center flex-wrap">
                <input
                  type="file"
                  id="semester4"
                  onChange={(e) => handleFileChange(e, 'semester4')}
                  className="block w-full text-xs sm:text-sm text-gray-500
                    file:mr-2 file:py-1 file:px-2
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  accept=".pdf"
                  disabled={documentStatus.semester4?.pending || documentStatus.semester4?.notApplicable}
                />
                {uploadStatus.semester4 && (
                  <span className="ml-2 text-green-500">✓</span>
                )}
              </div>
              <div className="mt-1 flex items-center space-x-4">
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.semester4?.pending || false}
                    onChange={() => handlePendingChange('semester4')}
                    disabled={documentStatus.semester4?.notApplicable}
                  />
                  <span className="ml-1">Pending</span>
                </label>
                
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.semester4?.notApplicable || false}
                    onChange={() => handleNotApplicableChange('semester4')}
                    disabled={documentStatus.semester4?.pending}
                  />
                  <span className="ml-1">Not Applicable</span>
                </label>
              </div>
            </div>
            
            {/* Semester 5 */}
            <div className="my-2">
              <p className="text-xs text-gray-600 mb-1">Semester 5</p>
              <div className="flex items-center flex-wrap">
                <input
                  type="file"
                  id="semester5"
                  onChange={(e) => handleFileChange(e, 'semester5')}
                  className="block w-full text-xs sm:text-sm text-gray-500
                    file:mr-2 file:py-1 file:px-2
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  accept=".pdf"
                  disabled={documentStatus.semester5?.pending || documentStatus.semester5?.notApplicable}
                />
                {uploadStatus.semester5 && (
                  <span className="ml-2 text-green-500">✓</span>
                )}
              </div>
              <div className="mt-1 flex items-center space-x-4">
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.semester5?.pending || false}
                    onChange={() => handlePendingChange('semester5')}
                    disabled={documentStatus.semester5?.notApplicable}
                  />
                  <span className="ml-1">Pending</span>
                </label>
                
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.semester5?.notApplicable || false}
                    onChange={() => handleNotApplicableChange('semester5')}
                    disabled={documentStatus.semester5?.pending}
                  />
                  <span className="ml-1">Not Applicable</span>
                </label>
              </div>
            </div>
            
            {/* Semester 6 */}
            <div className="my-2">
              <p className="text-xs text-gray-600 mb-1">Semester 6</p>
              <div className="flex items-center flex-wrap">
                <input
                  type="file"
                  id="semester6"
                  onChange={(e) => handleFileChange(e, 'semester6')}
                  className="block w-full text-xs sm:text-sm text-gray-500
                    file:mr-2 file:py-1 file:px-2
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  accept=".pdf"
                  disabled={documentStatus.semester6?.pending || documentStatus.semester6?.notApplicable}
                />
                {uploadStatus.semester6 && (
                  <span className="ml-2 text-green-500">✓</span>
                )}
              </div>
              <div className="mt-1 flex items-center space-x-4">
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.semester6?.pending || false}
                    onChange={() => handlePendingChange('semester6')}
                    disabled={documentStatus.semester6?.notApplicable}
                  />
                  <span className="ml-1">Pending</span>
                </label>
                
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.semester6?.notApplicable || false}
                    onChange={() => handleNotApplicableChange('semester6')}
                    disabled={documentStatus.semester6?.pending}
                  />
                  <span className="ml-1">Not Applicable</span>
                </label>
              </div>
            </div>
            
            {/* Semester 7 */}
            <div className="my-2">
              <p className="text-xs text-gray-600 mb-1">Semester 7</p>
              <div className="flex items-center flex-wrap">
                <input
                  type="file"
                  id="semester7"
                  onChange={(e) => handleFileChange(e, 'semester7')}
                  className="block w-full text-xs sm:text-sm text-gray-500
                    file:mr-2 file:py-1 file:px-2
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  accept=".pdf"
                  disabled={documentStatus.semester7?.pending || documentStatus.semester7?.notApplicable}
                />
                {uploadStatus.semester7 && (
                  <span className="ml-2 text-green-500">✓</span>
                )}
              </div>
              <div className="mt-1 flex items-center space-x-4">
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.semester7?.pending || false}
                    onChange={() => handlePendingChange('semester7')}
                    disabled={documentStatus.semester7?.notApplicable}
                  />
                  <span className="ml-1">Pending</span>
                </label>
                
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.semester7?.notApplicable || false}
                    onChange={() => handleNotApplicableChange('semester7')}
                    disabled={documentStatus.semester7?.pending}
                  />
                  <span className="ml-1">Not Applicable</span>
                </label>
              </div>
            </div>
            
            {/* Semester 8 */}
            <div className="my-2">
              <p className="text-xs text-gray-600 mb-1">Semester 8</p>
              <div className="flex items-center flex-wrap">
                <input
                  type="file"
                  id="semester8"
                  onChange={(e) => handleFileChange(e, 'semester8')}
                  className="block w-full text-xs sm:text-sm text-gray-500
                    file:mr-2 file:py-1 file:px-2
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  accept=".pdf"
                  disabled={documentStatus.semester8?.pending || documentStatus.semester8?.notApplicable}
                />
                {uploadStatus.semester8 && (
                  <span className="ml-2 text-green-500">✓</span>
                )}
              </div>
              <div className="mt-1 flex items-center space-x-4">
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.semester8?.pending || false}
                    onChange={() => handlePendingChange('semester8')}
                    disabled={documentStatus.semester8?.notApplicable}
                  />
                  <span className="ml-1">Pending</span>
                </label>
                
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.semester8?.notApplicable || false}
                    onChange={() => handleNotApplicableChange('semester8')}
                    disabled={documentStatus.semester8?.pending}
                  />
                  <span className="ml-1">Not Applicable</span>
                </label>
              </div>
            </div>
          </div>

          {/* Other Documents */}
          <div className="border p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">{(course === 'MBA' || course === 'MTech') ? '16' : '15'}. Other Documents</h3>
            
            {/* Provisional Admission Slip */}
            <div className="my-2">
              <p className="text-xs text-gray-600 mb-1">Provisional Admission Slip</p>
              <div className="flex items-center flex-wrap">
                <input
                  type="file"
                  id="provisionalAdmissionSlip"
                  onChange={(e) => handleFileChange(e, 'provisionalAdmissionSlip')}
                  className="block w-full text-xs sm:text-sm text-gray-500
                    file:mr-2 file:py-1 file:px-2
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  accept=".pdf"
                  disabled={documentStatus.provisionalAdmissionSlip?.pending || documentStatus.provisionalAdmissionSlip?.notApplicable}
                />
                {uploadStatus.provisionalAdmissionSlip && (
                  <span className="ml-2 text-green-500">✓</span>
                )}
              </div>
              <div className="mt-1 flex items-center space-x-4">
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.provisionalAdmissionSlip?.pending || false}
                    onChange={() => handlePendingChange('provisionalAdmissionSlip')}
                    disabled={documentStatus.provisionalAdmissionSlip?.notApplicable}
                  />
                  <span className="ml-1">Pending</span>
                </label>
                
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.provisionalAdmissionSlip?.notApplicable || false}
                    onChange={() => handleNotApplicableChange('provisionalAdmissionSlip')}
                    disabled={documentStatus.provisionalAdmissionSlip?.pending}
                  />
                  <span className="ml-1">Not Applicable</span>
                </label>
              </div>
            </div>
            
            {/* Payment Slip */}
            <div className="my-2">
              <p className="text-xs text-gray-600 mb-1">Payment Slip</p>
              <div className="flex items-center flex-wrap">
                <input
                  type="file"
                  id="paymentSlip"
                  onChange={(e) => handleFileChange(e, 'paymentSlip')}
                  className="block w-full text-xs sm:text-sm text-gray-500
                    file:mr-2 file:py-1 file:px-2
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  accept=".pdf"
                  disabled={documentStatus.paymentSlip?.pending || documentStatus.paymentSlip?.notApplicable}
                />
                {uploadStatus.paymentSlip && (
                  <span className="ml-2 text-green-500">✓</span>
                )}
              </div>
              <div className="mt-1 flex items-center space-x-4">
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.paymentSlip?.pending || false}
                    onChange={() => handlePendingChange('paymentSlip')}
                    disabled={documentStatus.paymentSlip?.notApplicable}
                  />
                  <span className="ml-1">Pending</span>
                </label>
                
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.paymentSlip?.notApplicable || false}
                    onChange={() => handleNotApplicableChange('paymentSlip')}
                    disabled={documentStatus.paymentSlip?.pending}
                  />
                  <span className="ml-1">Not Applicable</span>
                </label>
              </div>
            </div>
            
            {/* Study Centre Proof */}
            <div className="my-2">
              <p className="text-xs text-gray-600 mb-1">Study Centre Proof</p>
              <div className="flex items-center flex-wrap">
                <input
                  type="file"
                  id="studyCentreProof"
                  onChange={(e) => handleFileChange(e, 'studyCentreProof')}
                  className="block w-full text-xs sm:text-sm text-gray-500
                    file:mr-2 file:py-1 file:px-2
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  accept=".pdf"
                  disabled={documentStatus.studyCentreProof?.pending || documentStatus.studyCentreProof?.notApplicable}
                />
                {uploadStatus.studyCentreProof && (
                  <span className="ml-2 text-green-500">✓</span>
                )}
              </div>
              <div className="mt-1 flex items-center space-x-4">
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.studyCentreProof?.pending || false}
                    onChange={() => handlePendingChange('studyCentreProof')}
                    disabled={documentStatus.studyCentreProof?.notApplicable}
                  />
                  <span className="ml-1">Pending</span>
                </label>
                
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.studyCentreProof?.notApplicable || false}
                    onChange={() => handleNotApplicableChange('studyCentreProof')}
                    disabled={documentStatus.studyCentreProof?.pending}
                  />
                  <span className="ml-1">Not Applicable</span>
                </label>
              </div>
            </div>
            
            {/* Medical Certificate */}
            <div className="my-2">
              <p className="text-xs text-gray-600 mb-1">Medical Certificate</p>
              <div className="flex items-center flex-wrap">
                <input
                  type="file"
                  id="medicalCertificate"
                  onChange={(e) => handleFileChange(e, 'medicalCertificate')}
                  className="block w-full text-xs sm:text-sm text-gray-500
                    file:mr-2 file:py-1 file:px-2
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  accept=".pdf"
                  disabled={documentStatus.medicalCertificate?.pending || documentStatus.medicalCertificate?.notApplicable}
                />
                {uploadStatus.medicalCertificate && (
                  <span className="ml-2 text-green-500">✓</span>
                )}
              </div>
              <div className="mt-1 flex items-center space-x-4">
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.medicalCertificate?.pending || false}
                    onChange={() => handlePendingChange('medicalCertificate')}
                    disabled={documentStatus.medicalCertificate?.notApplicable}
                  />
                  <span className="ml-1">Pending</span>
                </label>
                
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.medicalCertificate?.notApplicable || false}
                    onChange={() => handleNotApplicableChange('medicalCertificate')}
                    disabled={documentStatus.medicalCertificate?.pending}
                  />
                  <span className="ml-1">Not Applicable</span>
                </label>
              </div>
            </div>
            
            {/* Defence Certificate */}
            <div className="my-2">
              <p className="text-xs text-gray-600 mb-1">Defence Certificate (if applicable)</p>
              <div className="flex items-center flex-wrap">
                <input
                  type="file"
                  id="defenceCertificate"
                  onChange={(e) => handleFileChange(e, 'defenceCertificate')}
                  className="block w-full text-xs sm:text-sm text-gray-500
                    file:mr-2 file:py-1 file:px-2
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  accept=".pdf"
                  disabled={documentStatus.defenceCertificate?.pending || documentStatus.defenceCertificate?.notApplicable}
                />
                {uploadStatus.defenceCertificate && (
                  <span className="ml-2 text-green-500">✓</span>
                )}
              </div>
              <div className="mt-1 flex items-center space-x-4">
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.defenceCertificate?.pending || false}
                    onChange={() => handlePendingChange('defenceCertificate')}
                    disabled={documentStatus.defenceCertificate?.notApplicable}
                  />
                  <span className="ml-1">Pending</span>
                </label>
                
                <label className="inline-flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-3 w-3 text-blue-600"
                    checked={documentStatus.defenceCertificate?.notApplicable || false}
                    onChange={() => handleNotApplicableChange('defenceCertificate')}
                    disabled={documentStatus.defenceCertificate?.pending}
                  />
                  <span className="ml-1">Not Applicable</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 p-3 sm:p-4 rounded-lg mt-4">
            <p className="font-semibold text-sm">Form Submission Error:</p>
            <div className="mt-2 whitespace-pre-line text-xs sm:text-sm">{error}</div>
          </div>
        )}

        {/* Undertaking for pending documents */}
        {hasPendingDocuments && (
          <div className="border p-3 sm:p-4 rounded-lg mt-4 bg-yellow-50">
            <h3 className="text-base font-semibold text-gray-700 mb-2">Undertaking for Pending Documents</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3">
              I hereby declare that I will submit the pending documents as marked above within the stipulated time period. 
              I understand that my admission is provisional until all the required documents are submitted.
            </p>
            <textarea
              className="w-full border rounded-md p-2 text-sm"
              rows="3"
              placeholder="Enter your undertaking statement and reasons for pending documents..."
              value={undertakingText}
              onChange={handleUndertakingChange}
              required
            ></textarea>
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

