import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Circulars = () => { 
  const navigate = useNavigate();
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCirculars = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const res = await axios.get(`http://localhost:8000/admin/getcirculars`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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
  }, []); // Remove course and semester dependency

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-indigo-600">📄 Latest Circulars</h2>
        <button
          onClick={() => navigate('/home')}
          className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300"
        >
          ← Back to Home
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : circulars.length === 0 ? (
        <p className="text-center text-gray-500">No circulars available for your course and semester</p>
      ) : (
        <ul className="space-y-4">
          {circulars.map((circular) => (
            <li
              key={circular._id}
              className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex-1">
                <span className="text-gray-800 font-medium">{circular.title}</span>
                <div className="text-sm text-gray-500 mt-1">
                  Course: {circular.course} | Semester: {circular.semester}
                </div>
              </div>
              <a
                href={`http://localhost:8000/${circular.pdfPath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-md text-sm transition"
              >
                View Circular
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Circulars;
