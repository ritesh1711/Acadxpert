import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdmissionForm() {
  const [agree, setAgree] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agree) {
      alert("Please agree to the declaration to proceed.");
      return;
    }
    navigate("/next-page");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg mb-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-800">Centre for Development of Advanced Computing</h1>
          <p className="text-md">B-30, Institutional Area, Sector 62, Noida – 201 309</p>
          <h2 className="text-xl font-semibold text-blue-600 mt-2">MCA Programme (1<sup>st</sup> Year - 1<sup>st</sup> Semester) 2024–2025</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input type="text" placeholder="Application No" className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="NIMCET / CET Rank" className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="Score" className="w-full border rounded px-3 py-2" />
        </div>

        <h3 className="text-lg font-bold text-gray-700">1. Candidate Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" placeholder="Name (English - in CAPITALS)" className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="Name (Hindi)" className="w-full border rounded px-3 py-2" />
          <input type="email" placeholder="Email ID" className="w-full border rounded px-3 py-2" />
          <input type="tel" placeholder="Mobile Number" className="w-full border rounded px-3 py-2" />
        </div>

        <h3 className="text-lg font-bold text-gray-700">2. Mother's Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" placeholder="Name (English - in CAPITALS)" className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="Name (Hindi)" className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="Occupation" className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="Office Address" className="w-full border rounded px-3 py-2" />
          <input type="email" placeholder="Email ID" className="w-full border rounded px-3 py-2" />
          <input type="tel" placeholder="Phone No." className="w-full border rounded px-3 py-2" />
        </div>

        <h3 className="text-lg font-bold text-gray-700">3. Father's Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" placeholder="Name (English - in CAPITALS)" className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="Name (Hindi)" className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="Occupation" className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="Office Address" className="w-full border rounded px-3 py-2" />
          <input type="email" placeholder="Email ID" className="w-full border rounded px-3 py-2" />
          <input type="tel" placeholder="Phone No." className="w-full border rounded px-3 py-2" />
        </div>

        <h3 className="text-lg font-bold text-gray-700">4. Permanent Address</h3>
        <textarea placeholder="Full Address" className="w-full border rounded px-3 py-2" rows="3"></textarea>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input type="text" placeholder="State" className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="District" className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="PIN Code" className="w-full border rounded px-3 py-2" />
        </div>

        <h3 className="text-lg font-bold text-gray-700">5. Correspondence Address</h3>
        <textarea placeholder="Correspondence Address" className="w-full border rounded px-3 py-2" rows="3"></textarea>
        <input type="email" placeholder="Email ID" className="w-full border rounded px-3 py-2" />

        <h3 className="text-lg font-bold text-gray-700">6. Date of Birth</h3>
        <div className="grid grid-cols-3 gap-6">
          <input type="text" placeholder="Day" className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="Month" className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="Year" className="w-full border rounded px-3 py-2" />
        </div>

        <h3 className="text-lg font-bold text-gray-700">7. Category</h3>
        <input type="text" placeholder="GEN / SC / ST / SPON / EWS" className="w-full border rounded px-3 py-2" />

        <div className="mt-8 text-gray-700">
          <p className="font-semibold">11. Declaration</p>
          <p className="text-sm mt-2">
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
            <span className="text-sm text-gray-700">I agree to the declaration above.</span>
          </label>
        </div>

        <div className="text-right pt-6">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}
