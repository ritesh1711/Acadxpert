import React, { useState } from "react";

export default function Nextpageupload() {
  const [files, setFiles] = useState({
    photograph: null,
    signature: null,
    scorecard: null,
    marksheet10: null,
    marksheet12: null,
    graduation: null,
    character: null,
    provisional: null,
  });

  const handleChange = (e, name) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }
    setFiles({ ...files, [name]: file });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    for (const key in files) {
      if (!files[key]) {
        alert(`Please upload ${key.replace(/([A-Z])/g, ' $1')} PDF.`);
        return;
      }
    }
    alert("All files uploaded successfully!");
    // You can handle file upload to server here using FormData
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">Upload Required Documents (PDF Only)</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FileInput label="Student Photograph" name="photograph" file={files.photograph} onChange={handleChange} />
          <FileInput label="Signature" name="signature" file={files.signature} onChange={handleChange} />
          <FileInput label="Scorecard" name="scorecard" file={files.scorecard} onChange={handleChange} />
          <FileInput label="10th Class Marksheet" name="marksheet10" file={files.marksheet10} onChange={handleChange} />
          <FileInput label="12th Class Marksheet" name="marksheet12" file={files.marksheet12} onChange={handleChange} />
          <FileInput label="Graduation Marksheets (All 6 Semesters)" name="graduation" file={files.graduation} onChange={handleChange} />
          <FileInput label="Character Certificate" name="character" file={files.character} onChange={handleChange} />
          <FileInput label="Provisional Certificate" name="provisional" file={files.provisional} onChange={handleChange} />

          <div className="text-right pt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FileInput({ label, name, file, onChange }) {
  return (
    <div>
      <label className="block font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => onChange(e, name)}
          className="w-full border rounded px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          required
        />
        {file && (
          <a
            href={URL.createObjectURL(file)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm"
          >
            Preview
          </a>
        )}
      </div>
    </div>
  );
}
