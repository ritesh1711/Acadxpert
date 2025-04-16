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

        const response = await axios.get('https://acadxpert-main.onrender.com/admission/user/admission', {
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
      
      // We only care if required documents are uploaded
      const requiredUploaded = ['photo', 'signature'].every(
        doc => updatedStatus[doc] || false
      );
      setAllUploaded(requiredUploaded);
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
        'https://acadxpert-main.onrender.com/admission/submit',
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
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-6">
          Please upload the following documents in PDF or image format.<br/>
          <span className="text-red-500 font-bold">*</span> indicates required documents.
        </p>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Required Documents Section */}
          <div className="border-b pb-4">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Required Documents</h3>
            
            {/* Photo Upload */}
            <div className="border p-3 sm:p-4 rounded-lg mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">
                1. Recent Photograph <span className="text-red-500">*</span>
              </h3>
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
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">
                2. Signature <span className="text-red-500">*</span>
              </h3>
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
          </div>
          
          {/* Educational Documents Section */}
          <div className="border-b pb-4">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Educational Documents</h3>

            {/* 10th Marksheet Upload */}
            <div className="border p-3 sm:p-4 rounded-lg mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">10th Marksheet</h3>
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
            <div className="border p-3 sm:p-4 rounded-lg mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">10th Passing Certificate</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload your 10th standard passing certificate (PDF)</p>
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
            <div className="border p-3 sm:p-4 rounded-lg mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">12th Marksheet</h3>
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
            <div className="border p-3 sm:p-4 rounded-lg mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">12th Passing Certificate</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload your 12th standard passing certificate (PDF)</p>
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
            <div className="border p-3 sm:p-4 rounded-lg mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Graduation Marksheet</h3>
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
          </div>

          {/* Semester Marksheets Section */}
          <div className="border-b pb-4">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Semester Marksheets</h3>
            
            {/* Create semester inputs 1-8 */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <div key={sem} className="border p-3 sm:p-4 rounded-lg mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Semester {sem} Marksheet</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload your semester {sem} marksheet (PDF)</p>
                <div className="flex items-center flex-wrap">
                  <input
                    type="file"
                    id={`semester${sem}`}
                    onChange={(e) => handleFileChange(e, `semester${sem}`)}
                    className="block w-full text-xs sm:text-sm text-gray-500
                      file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                      file:rounded-full file:border-0
                      file:text-xs file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                    accept=".pdf"
                  />
                  {uploadStatus[`semester${sem}`] && (
                    <span className="ml-2 text-green-500">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Entrance Exam Documents Section */}
          <div className="border-b pb-4">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Entrance Exam Documents</h3>
            
            {/* Entrance Admit Card */}
            <div className="border p-3 sm:p-4 rounded-lg mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">NIMCET/CET Admit Card</h3>
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
            
            {/* Entrance Score Card */}
            <div className="border p-3 sm:p-4 rounded-lg mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">NIMCET/CET Score Card</h3>
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
          </div>

          {/* Other Documents Section */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-3">Other Documents</h3>
            
            {/* Add form fields for the remaining document types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First column */}
              <div>
                {/* Provisional Certificate */}
                <div className="border p-3 sm:p-4 rounded-lg mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Provisional Certificate</h3>
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
                
                {/* Character Certificate */}
                <div className="border p-3 sm:p-4 rounded-lg mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Character Certificate</h3>
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
                
                {/* Provisional Admission Slip */}
                <div className="border p-3 sm:p-4 rounded-lg mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Provisional Admission Slip</h3>
                  <div className="flex items-center flex-wrap">
                    <input
                      type="file"
                      id="provisionalAdmissionSlip"
                      onChange={(e) => handleFileChange(e, 'provisionalAdmissionSlip')}
                      className="block w-full text-xs sm:text-sm text-gray-500
                        file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                        file:rounded-full file:border-0
                        file:text-xs file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                      accept=".pdf"
                    />
                    {uploadStatus.provisionalAdmissionSlip && (
                      <span className="ml-2 text-green-500">✓</span>
                    )}
                  </div>
                </div>
                
                {/* Payment Slip */}
                <div className="border p-3 sm:p-4 rounded-lg mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Payment Slip</h3>
                  <div className="flex items-center flex-wrap">
                    <input
                      type="file"
                      id="paymentSlip"
                      onChange={(e) => handleFileChange(e, 'paymentSlip')}
                      className="block w-full text-xs sm:text-sm text-gray-500
                        file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                        file:rounded-full file:border-0
                        file:text-xs file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                      accept=".pdf"
                    />
                    {uploadStatus.paymentSlip && (
                      <span className="ml-2 text-green-500">✓</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Second column */}
              <div>
                {/* Study Centre Proof */}
                <div className="border p-3 sm:p-4 rounded-lg mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Study Centre Proof</h3>
                  <div className="flex items-center flex-wrap">
                    <input
                      type="file"
                      id="studyCentreProof"
                      onChange={(e) => handleFileChange(e, 'studyCentreProof')}
                      className="block w-full text-xs sm:text-sm text-gray-500
                        file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                        file:rounded-full file:border-0
                        file:text-xs file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                      accept=".pdf"
                    />
                    {uploadStatus.studyCentreProof && (
                      <span className="ml-2 text-green-500">✓</span>
                    )}
                  </div>
                </div>
                
                {/* Medical Certificate */}
                <div className="border p-3 sm:p-4 rounded-lg mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Medical Certificate</h3>
                  <div className="flex items-center flex-wrap">
                    <input
                      type="file"
                      id="medicalCertificate"
                      onChange={(e) => handleFileChange(e, 'medicalCertificate')}
                      className="block w-full text-xs sm:text-sm text-gray-500
                        file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                        file:rounded-full file:border-0
                        file:text-xs file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                      accept=".pdf"
                    />
                    {uploadStatus.medicalCertificate && (
                      <span className="ml-2 text-green-500">✓</span>
                    )}
                  </div>
                </div>
                
                {/* Category Certificate */}
                <div className="border p-3 sm:p-4 rounded-lg mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Reserved Category Certificate</h3>
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
                
                {/* Defence/PH Certificate */}
                <div className="border p-3 sm:p-4 rounded-lg mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Defense/PH Certificate</h3>
                  <div className="flex items-center flex-wrap">
                    <input
                      type="file"
                      id="defenceCertificate"
                      onChange={(e) => handleFileChange(e, 'defenceCertificate')}
                      className="block w-full text-xs sm:text-sm text-gray-500
                        file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4
                        file:rounded-full file:border-0
                        file:text-xs file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                      accept=".pdf"
                    />
                    {uploadStatus.defenceCertificate && (
                      <span className="ml-2 text-green-500">✓</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* ID Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Aadhaar Card */}
              <div className="border p-3 sm:p-4 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Aadhaar Card</h3>
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
              
              {/* PAN Card */}
              <div className="border p-3 sm:p-4 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">PAN Card</h3>
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