import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Circulars = () => {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCirculars = async () => {
    try {
      const res = await axios.get('http://localhost:8000/admin/circulars');
      setCirculars(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching circulars:', err);
      setError('Failed to load circulars');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCirculars();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-xl border border-gray-200">
      <h2 className="text-2xl font-semibold text-center mb-6 text-indigo-600">📄 Latest Circulars</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : circulars.length === 0 ? (
        <p className="text-center text-gray-500">No circulars available</p>
      ) : (
        <ul className="space-y-4">
          {circulars.map((circular) => (
            <li key={circular._id} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg hover:bg-gray-100 transition">
              <span className="text-gray-800 font-medium">{circular.title}</span>
              <a
                href={`http://localhost:8000/${circular.pdfPath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-md text-sm transition"
              >
                View PDF
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Circulars;