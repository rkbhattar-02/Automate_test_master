import axios from 'axios';
import type { ObjectRepository, TestData } from '../types';

const API_URL = 'http://localhost:5001/api';

// Object Repository API
export const getObjectRepository = async (): Promise<ObjectRepository> => {
  const response = await axios.get(`${API_URL}/workspace/object-repository`);
  return response.data;
};

export const updateObjectRepository = async (objectRepo: ObjectRepository): Promise<ObjectRepository> => {
  const response = await axios.put(`${API_URL}/workspace/object-repository`, objectRepo);
  return response.data;
};

// Test Data API
export const getTestData = async (): Promise<TestData> => {
  const response = await axios.get(`${API_URL}/workspace/test-data`);
  return response.data;
};

export const updateTestData = async (testData: TestData): Promise<TestData> => {
  const response = await axios.put(`${API_URL}/workspace/test-data`, testData);
  return response.data;
};