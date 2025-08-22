import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdmissionForm() {
  const [agree, setAgree] = useState(false);
  const [formData, setFormData] = useState({
    // Application Information
    applicationNo: "",
    nimcetRank: "",
    catRank: "",
    gateRank: "",
    score: "",
    
    // Course Information
    course: "",
    semester: "",
    
    // Candidate Information
    nameEnglish: "",
    nameHindi: "",
    email: "",
    mobileNumber: "",
    
    // Mother's Information
    motherNameEnglish: "",
    motherNameHindi: "",
    motherOccupation: "",
    motherOfficeAddress: "",
    motherEmail: "",
    motherPhone: "",
    
    // Father's Information
    fatherNameEnglish: "",
    fatherNameHindi: "",
    fatherOccupation: "",
    fatherOfficeAddress: "",
    fatherEmail: "",
    fatherPhone: "",
    
    // Address Information
    permanentAddress: "",
    state: "",
    district: "",
    pinCode: "",
    correspondenceAddress: "",
    correspondenceEmail: "",
    
    // Personal Information
    dateOfBirth: {
      day: "",
      month: "",
      year: ""
    },
    category: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const navigate = useNavigate();

  // Initialize form with course and semester from localStorage
  useEffect(() => {
    const course = localStorage.getItem("course") || "MCA";
    const semester = localStorage.getItem("semester") || "1";
    
    setFormData(prev => ({
      ...prev,
      course,
      semester
    }));
  }, []);

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
        if (err.response && err.response.status !== 404) {
          console.error("Error checking existing submission:", err);
          setError("Error checking your submission status. Please try again.");
        }
      }
    };

    checkExistingSubmission();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested dateOfBirth object
    if (name.startsWith('dateOfBirth.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dateOfBirth: {
          ...prev.dateOfBirth,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agree) {
      alert("Please agree to the declaration to proceed.");
      return;
    }

    // Validate required fields
    const requiredFields = [
      { field: 'applicationNo', label: 'Application Number' },
      { field: 'nameEnglish', label: 'Name (English)' },
      { field: 'email', label: 'Email ID' },
      { field: 'mobileNumber', label: 'Mobile Number' }
    ];

    let missingFields = [];
    requiredFields.forEach(({ field, label }) => {
      if (!formData[field]) {
        missingFields.push(label);
      }
    });

    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
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

      // Prepare payload for duplicate check
      const checkPayload = {
        applicationNo: formData.applicationNo,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        nimcetRank: formData.nimcetRank || null,
        catRank: formData.catRank || null,
        gateRank: formData.gateRank || null
      };

      // Call backend to check for duplicates
      const duplicateRes = await axios.post(
        "http://localhost:8000/admission/check-duplicate",
        checkPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (duplicateRes.data.duplicate) {
        setError(duplicateRes.data.message || "Duplicate entry found. Please check your details.");
        return;
      }

      // Save form data to localStorage for the next step
      localStorage.setItem("admissionFormData", JSON.stringify(formData));

      // Navigate to document upload page
      navigate("/document-upload");
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err.response?.data?.message || "An error occurred while submitting the form");
    } finally {
      setLoading(false);
    }
  };

  // Get course and program name for display
  const getCourseTitle = () => {
    const course = formData.course || localStorage.getItem("course") || "MCA";
    const semester = formData.semester || localStorage.getItem("semester") || "1";
    
    let programName = "Master of Computer Applications";
    if (course === "MBA") {
      programName = "Master of Business Administration";
    } else if (course === "MTech") {
      programName = "Master of Technology";
    }
    
    return `${course} Programme (1<sup>st</sup> Year - ${semester}<sup>${getSemesterSuffix(semester)}</sup> Semester) 2024–2025`;
  };
  
  // Helper function to get the correct suffix for semester
  const getSemesterSuffix = (semester) => {
    switch(semester) {
      case "1": return "st";
      case "2": return "nd";
      case "3": return "rd";
      default: return "th";
    }
  };

  // Helper function to get the correct rank field placeholder based on course
  const getRankFieldPlaceholder = () => {
    const course = formData.course || localStorage.getItem("course") || "MCA";
    
    switch(course) {
      case "MCA": return "NIMCET / CET Rank";
      case "MBA": return "CAT / CET Rank";
      case "MTech": return "GATE / CET Rank";
      default: return "Entrance Exam Rank";
    }
  };

  // Helper function to get the correct rank field name based on course
  const getRankFieldName = () => {
    const course = formData.course || localStorage.getItem("course") || "MCA";
    
    switch(course) {
      case "MCA": return "nimcetRank";
      case "MBA": return "catRank";
      case "MTech": return "gateRank";
      default: return "nimcetRank";
    }
  };

  // Helper function to get the rank value based on course
  const getRankValue = () => {
    const course = formData.course || localStorage.getItem("course") || "MCA";
    
    switch(course) {
      case "MCA": return formData.nimcetRank || "";
      case "MBA": return formData.catRank || "";
      case "MTech": return formData.gateRank || "";
      default: return "";
    }
  };

  // If user has already submitted a form, show message and their submission details
  if (hasSubmitted && submissionData) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-800">Centre for Development of Advanced Computing</h1>
            <p className="text-md">B-30, Institutional Area, Sector 62, Noida – 201 309</p>
            <h2 className="text-xl font-semibold text-blue-600 mt-2" dangerouslySetInnerHTML={{ __html: getCourseTitle() }}></h2>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-md text-green-700 font-medium">
                  You have already submitted an admission form.
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Your application has been submitted successfully.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-700 mb-4">Application Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-b pb-2">
              <span className="font-semibold text-gray-600">Application No: </span>
              <span>{submissionData.applicationNo}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-semibold text-gray-600">Name: </span>
              <span>{submissionData.nameEnglish}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-semibold text-gray-600">Course: </span>
              <span>{submissionData.course || localStorage.getItem("course") || "MCA"}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-semibold text-gray-600">Semester: </span>
              <span>{submissionData.semester || localStorage.getItem("semester") || "1"}</span>
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

          <div className="mt-6 flex justify-between">
            <button 
              onClick={() => navigate('/home')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-800">Centre for Development of Advanced Computing</h1>
          <p className="text-md">B-30, Institutional Area, Sector 62, Noida – 201 309</p>
          <h2 className="text-xl font-semibold text-blue-600 mt-2" dangerouslySetInnerHTML={{ __html: getCourseTitle() }}></h2>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
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

        {/* Display form here */}
        {/* Existing form content */        
        /* Additional Course Info Section - Read-only to show currently selected course */}
        <div className="mb-6 border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Course</label>
              <div className="mt-1 p-2 bg-gray-100 rounded-md">
                {formData.course || localStorage.getItem("course") || "MCA"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Semester</label>
              <div className="mt-1 p-2 bg-gray-100 rounded-md">
                {formData.semester || localStorage.getItem("semester") || "1"}
              </div>
            </div>
          </div>
        </div>
        
        {/* Rest of the form remains unchanged */}
        <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-8 rounded-lg shadow-lg space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            <input 
              type="text" 
              name="applicationNo"
              value={formData.applicationNo}
              onChange={handleChange}
              placeholder="Application No" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
              required
            />
            <input 
              type="text" 
              name={getRankFieldName()}
              value={getRankValue()}
              onChange={handleChange}
              placeholder={getRankFieldPlaceholder()} 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
            <input 
              type="text" 
              name="score"
              value={formData.score}
              onChange={handleChange}
              placeholder="Score" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
          </div>

          <h3 className="text-md sm:text-lg font-bold text-gray-700">1. Candidate Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <input 
              type="text" 
              name="nameEnglish"
              value={formData.nameEnglish}
              onChange={handleChange}
              placeholder="Name (English - in CAPITALS)" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
              required
            />
            <input 
              type="text" 
              name="nameHindi"
              value={formData.nameHindi}
              onChange={handleChange}
              placeholder="Name (Hindi)" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email ID" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
              required
            />
            <input 
              type="tel" 
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Mobile Number" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
              required
            />
          </div>

          <h3 className="text-md sm:text-lg font-bold text-gray-700">2. Mother's Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <input 
              type="text" 
              name="motherNameEnglish"
              value={formData.motherNameEnglish}
              onChange={handleChange}
              placeholder="Name (English - in CAPITALS)" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
            <input 
              type="text" 
              name="motherNameHindi"
              value={formData.motherNameHindi}
              onChange={handleChange}
              placeholder="Name (Hindi)" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
            <input 
              type="text" 
              name="motherOccupation"
              value={formData.motherOccupation}
              onChange={handleChange}
              placeholder="Occupation" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
            <input 
              type="text" 
              name="motherOfficeAddress"
              value={formData.motherOfficeAddress}
              onChange={handleChange}
              placeholder="Office Address" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
            <input 
              type="email" 
              name="motherEmail"
              value={formData.motherEmail}
              onChange={handleChange}
              placeholder="Email ID" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
            <input 
              type="tel" 
              name="motherPhone"
              value={formData.motherPhone}
              onChange={handleChange}
              placeholder="Phone No." 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
          </div>

          <h3 className="text-md sm:text-lg font-bold text-gray-700">3. Father's Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <input 
              type="text" 
              name="fatherNameEnglish"
              value={formData.fatherNameEnglish}
              onChange={handleChange}
              placeholder="Name (English - in CAPITALS)" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
            <input 
              type="text" 
              name="fatherNameHindi"
              value={formData.fatherNameHindi}
              onChange={handleChange}
              placeholder="Name (Hindi)" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
            <input 
              type="text" 
              name="fatherOccupation"
              value={formData.fatherOccupation}
              onChange={handleChange}
              placeholder="Occupation" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
            <input 
              type="text" 
              name="fatherOfficeAddress"
              value={formData.fatherOfficeAddress}
              onChange={handleChange}
              placeholder="Office Address" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
            <input 
              type="email" 
              name="fatherEmail"
              value={formData.fatherEmail}
              onChange={handleChange}
              placeholder="Email ID" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
            <input 
              type="tel" 
              name="fatherPhone"
              value={formData.fatherPhone}
              onChange={handleChange}
              placeholder="Phone No." 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
          </div>

          <h3 className="text-md sm:text-lg font-bold text-gray-700">4. Permanent Address</h3>
          <textarea 
            name="permanentAddress"
            value={formData.permanentAddress}
            onChange={handleChange}
            placeholder="Full Address" 
            className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            rows="3"
          ></textarea>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            <input 
              type="text" 
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
            <input 
              type="text" 
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="District" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
            <input 
              type="text" 
              name="pinCode"
              value={formData.pinCode}
              onChange={handleChange}
              placeholder="PIN Code" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
          </div>

          <h3 className="text-md sm:text-lg font-bold text-gray-700">5. Correspondence Address</h3>
          <textarea 
            name="correspondenceAddress"
            value={formData.correspondenceAddress}
            onChange={handleChange}
            placeholder="Correspondence Address" 
            className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            rows="3"
          ></textarea>
          <input 
            type="email" 
            name="correspondenceEmail"
            value={formData.correspondenceEmail}
            onChange={handleChange}
            placeholder="Email ID" 
            className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
          />

          <h3 className="text-md sm:text-lg font-bold text-gray-700">6. Date of Birth</h3>
          <div className="grid grid-cols-3 gap-6">
            <input 
              type="text" 
              name="dateOfBirth.day"
              value={formData.dateOfBirth.day}
              onChange={handleChange}
              placeholder="Day" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
            <input 
              type="text" 
              name="dateOfBirth.month"
              value={formData.dateOfBirth.month}
              onChange={handleChange}
              placeholder="Month" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
            <input 
              type="text" 
              name="dateOfBirth.year"
              value={formData.dateOfBirth.year}
              onChange={handleChange}
              placeholder="Year" 
              className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
            />
          </div>

          <h3 className="text-md sm:text-lg font-bold text-gray-700">7. Category</h3>
          <input 
            type="text" 
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="GEN / SC / ST / SPON / EWS" 
            className="w-full border rounded px-3 py-2 text-sm sm:text-base" 
          />

          <div className="mt-6 text-gray-700">
            <p className="font-semibold">11. Declaration</p>
            <p className="text-xs sm:text-sm mt-2">
              I hereby solemnly and sincerely affirm that the statements made and information furnished by me in this application form are true and correct. Also, I have not withheld any information.
            </p>
            <label className="flex items-center mt-4">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mr-2"
                required
              />
              <span className="text-xs sm:text-sm text-gray-700">I agree to the declaration above.</span>
            </label>
          </div>

          <div className="text-right pt-4 sm:pt-6">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 py-2 rounded text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? "Processing..." : "Next"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
