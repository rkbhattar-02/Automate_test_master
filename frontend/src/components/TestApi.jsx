// src/components/TestApi.jsx
import React, { useState, useEffect } from 'react';
import { fetchTestSets } from '../services/api';

function TestApi() {
  const [testSets, setTestSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTestSets = async () => {
      setLoading(true);
      try {
        const data = await fetchTestSets();
        setTestSets(data);
        setError(null);
      } catch (err) {
        setError('Failed to load test sets from API');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTestSets();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test API Connection</h2>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <div>
          <p className="mb-2">Successfully connected to API!</p>
          <h3 className="font-bold mt-4 mb-2">Test Sets from Backend:</h3>
          <ul className="list-disc pl-5">
            {testSets.map(testSet => (
              <li key={testSet.id} className="mb-2">
                <span className="font-semibold">{testSet.name}</span>
                {testSet.locked && <span className="ml-2 text-yellow-500">(Locked)</span>}
                <p className="text-sm text-gray-600">{testSet.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TestApi;