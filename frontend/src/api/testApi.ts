import axios from 'axios';
import type { TestSet, TestCase } from '../types';

const API_URL = 'http://localhost:5001/api';

// Test Set API
export const getTestSets = async (): Promise<TestSet[]> => {
  const response = await axios.get(`${API_URL}/test-sets`);
  return response.data;
};

export const createTestSet = async (testSet: Partial<TestSet>): Promise<TestSet> => {
  const response = await axios.post(`${API_URL}/test-sets`, testSet);
  return response.data;
};

export const updateTestSet = async (testSet: TestSet): Promise<TestSet> => {
  const response = await axios.put(`${API_URL}/test-sets/${testSet.id}`, testSet);
  return response.data;
};

export const deleteTestSet = async (testSetId: string): Promise<void> => {
  await axios.delete(`${API_URL}/test-sets/${testSetId}`);
};

export const toggleLockTestSet = async (testSetId: string): Promise<TestSet> => {
  const response = await axios.put(`${API_URL}/test-sets/${testSetId}/lock`);
  return response.data;
};

// Test Case API
export const getTestCases = async (testSetId: string): Promise<TestCase[]> => {
  const response = await axios.get(`${API_URL}/test-sets/${testSetId}/test-cases`);
  return response.data;
};

export const createTestCase = async (testSetId: string, testCase: Partial<TestCase>): Promise<TestCase> => {
  const response = await axios.post(`${API_URL}/test-sets/${testSetId}/test-cases`, testCase);
  return response.data;
};

export const updateTestCase = async (testSetId: string, testCase: TestCase): Promise<TestCase> => {
  const response = await axios.put(`${API_URL}/test-sets/${testSetId}/test-cases/${testCase.id}`, testCase);
  return response.data;
};

export const deleteTestCase = async (testSetId: string, testCaseId: string): Promise<void> => {
  await axios.delete(`${API_URL}/test-sets/${testSetId}/test-cases/${testCaseId}`);
};

export const toggleLockTestCase = async (testSetId: string, testCaseId: string): Promise<TestCase> => {
  const response = await axios.put(`${API_URL}/test-sets/${testSetId}/test-cases/${testCaseId}/lock`);
  return response.data;
};