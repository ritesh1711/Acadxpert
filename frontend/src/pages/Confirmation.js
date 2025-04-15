import React from "react";
import { Link } from "react-router-dom";

export default function Confirmation() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg mb-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-800">Centre for Development of Advanced Computing</h1>
          <p className="text-md">B-30, Institutional Area, Sector 62, Noida – 201 309</p>
          <h2 className="text-xl font-semibold text-blue-600 mt-2">MCA Programme (1<sup>st</sup> Year - 1<sup>st</sup> Semester) 2024–2025</h2>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
        <div className="text-center">
          <svg 
            className="mx-auto h-16 w-16 text-green-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Application Submitted Successfully!</h2>
          <p className="mt-2 text-gray-600">Your admission application has been received.</p>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Next Steps</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>Your application will be reviewed by our admissions team.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>You will receive an email with further instructions within 5-7 business days.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>Please keep your application number handy for future reference.</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">If you have any questions, please contact our support team.</p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded"
            >
              Return to Home
            </Link>
            <a 
              href="mailto:support@cdac.in" 
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 