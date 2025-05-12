// src/services/api.js
const API_BASE_URL = 'http://localhost:8000/api';

export const fetchTestSets = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/test-sets`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching test sets:', error);
    throw error;
  }
};