import React, { useState, useEffect } from 'react';
import * as testApi from './api/testApi';
import { TestSet, TestCase } from './types';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

interface ApiTestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message?: string;
  data?: any;
  error?: any;
}

export function ApiTester() {
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testSetId, setTestSetId] = useState<string | null>(null);
  const [testCaseId, setTestCaseId] = useState<string | null>(null);
  const [overallStatus, setOverallStatus] = useState<'success' | 'error' | 'pending' | 'not-run'>('not-run');

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    setOverallStatus('pending');
    
    try {
      // Test 1: Get all test sets
      await runTest('Get all test sets', async () => {
        const testSets = await testApi.getTestSets();
        if (testSets.length > 0) {
          setTestSetId(testSets[0].id);
          if (testSets[0].testCases && testSets[0].testCases.length > 0) {
            setTestCaseId(testSets[0].testCases[0].id);
          }
        }
        return testSets;
      });

      // Test 2: Create a test set
      let createdTestSet: TestSet | null = null;
      await runTest('Create a test set', async () => {
        const newTestSet = {
          name: `Test Set ${Date.now()}`,
          description: 'Created during API testing'
        };
        createdTestSet = await testApi.createTestSet(newTestSet);
        return createdTestSet;
      });

      // Test 3: Create a test case
      let createdTestCase: TestCase | null = null;
      if (createdTestSet) {
        await runTest('Create a test case', async () => {
          const newTestCase = {
            name: `Test Case ${Date.now()}`,
            description: 'Created during API testing',
            steps: [],
            tags: ['api-test'],
            status: 'draft' as const
          };
          createdTestCase = await testApi.createTestCase(createdTestSet!.id, newTestCase);
          return createdTestCase;
        });
      }

      // Test 4: Update a test case
      if (createdTestSet && createdTestCase) {
        await runTest('Update a test case', async () => {
          const updatedTestCase = {
            ...createdTestCase!,
            description: 'Updated during API testing',
            steps: [
              {
                id: '1',
                type: 'keyword' as const,
                action: 'click',
                parameters: { target: 'loginButton' },
                expected: 'Button clicked'
              }
            ]
          };
          return await testApi.updateTestCase(createdTestSet!.id, updatedTestCase);
        });
      }

      // Test 5: Toggle lock on a test case
      if (createdTestSet && createdTestCase) {
        await runTest('Toggle lock on a test case', async () => {
          return await testApi.toggleLockTestCase(createdTestSet!.id, createdTestCase!.id);
        });
      }

      // Test 6: Toggle lock on a test set
      if (createdTestSet) {
        await runTest('Toggle lock on a test set', async () => {
          return await testApi.toggleLockTestSet(createdTestSet!.id);
        });
      }

      // Test 7: Delete a test case
      if (createdTestSet && createdTestCase) {
        await runTest('Delete a test case', async () => {
          await testApi.deleteTestCase(createdTestSet!.id, createdTestCase!.id);
          return { success: true };
        });
      }

      // Test 8: Delete a test set
      if (createdTestSet) {
        await runTest('Delete a test set', async () => {
          await testApi.deleteTestSet(createdTestSet!.id);
          return { success: true };
        });
      }

      // Check if all tests passed
      const allPassed = results.every(result => result.status === 'success');
      setOverallStatus(allPassed ? 'success' : 'error');
    } catch (error) {
      // Safely handle the error without passing non-serializable objects
      console.error('Error running tests:', 
        error instanceof Error ? error.message : 'Unknown error');
      setOverallStatus('error');
    } finally {
      setIsRunning(false);
    }
  };

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    setResults(prev => [...prev, { name, status: 'pending' }]);
    
    try {
      const data = await testFn();
      setResults(prev => 
        prev.map(result => 
          result.name === name 
            ? { name, status: 'success', data, message: 'Test passed successfully' } 
            : result
        )
      );
      return data;
    } catch (error) {
      // Safely handle the error without passing non-serializable objects
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error in test "${name}":`, errorMessage);
      
      // Create a serializable error object
      const serializableError = {
        message: errorMessage,
        name: error instanceof Error ? error.name : 'Error',
        stack: error instanceof Error ? error.stack : undefined
      };
      
      setResults(prev => 
        prev.map(result => 
          result.name === name 
            ? { 
                name, 
                status: 'error', 
                error: serializableError, 
                message: errorMessage
              } 
            : result
        )
      );
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">API Test Tool</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span className="mr-2">Status:</span>
              {overallStatus === 'not-run' && (
                <span className="text-gray-500">Not Run</span>
              )}
              {overallStatus === 'pending' && (
                <span className="text-primary-500 flex items-center">
                  <RefreshCw className="w-5 h-5 mr-1 animate-spin" />
                  Running...
                </span>
              )}
              {overallStatus === 'success' && (
                <span className="text-green-500 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-1" />
                  All Tests Passed
                </span>
              )}
              {overallStatus === 'error' && (
                <span className="text-red-500 flex items-center">
                  <XCircle className="w-5 h-5 mr-1" />
                  Tests Failed
                </span>
              )}
            </div>
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className={`px-4 py-2 rounded-md text-white ${
                isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {isRunning ? (
                <span className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </span>
              ) : (
                'Run All Tests'
              )}
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <div className="flex items-center text-amber-600 mb-2">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <h2 className="font-semibold">Important</h2>
          </div>
          <p className="text-gray-700">
            This tool will create and delete test data to verify API functionality. 
            Make sure your backend server is running at <code className="bg-gray-200 px-1 py-0.5 rounded">http://localhost:5001</code>.
          </p>
          <div className="mt-2 text-sm">
            <p className="font-medium">To start the backend server:</p>
            <pre className="bg-gray-800 text-white p-2 rounded mt-1">npm run backend</pre>
          </div>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-md ${
                result.status === 'success' ? 'bg-green-50 border border-green-200' : 
                result.status === 'error' ? 'bg-red-50 border border-red-200' : 
                'bg-blue-50 border border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500 mr-2" />}
                  {result.status === 'error' && <XCircle className="w-5 h-5 text-red-500 mr-2" />}
                  {result.status === 'pending' && <RefreshCw className="w-5 h-5 text-blue-500 mr-2 animate-spin" />}
                  <h3 className="font-medium">{result.name}</h3>
                </div>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  result.status === 'success' ? 'bg-green-100 text-green-800' : 
                  result.status === 'error' ? 'bg-red-100 text-red-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {result.status === 'success' ? 'Success' : 
                   result.status === 'error' ? 'Failed' : 
                   'Running...'}
                </span>
              </div>
              
              {result.message && (
                <p className={`mt-2 text-sm ${
                  result.status === 'success' ? 'text-green-600' : 
                  result.status === 'error' ? 'text-red-600' : 
                  'text-blue-600'
                }`}>
                  {result.message}
                </p>
              )}
              
              {result.status === 'success' && result.data && (
                <div className="mt-2">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                      View Response Data
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-800 text-green-300 rounded overflow-auto max-h-40 text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
              
              {result.status === 'error' && result.error && (
                <div className="mt-2">
                  <details className="text-sm" open>
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                      View Error Details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-800 text-red-300 rounded overflow-auto max-h-40 text-xs">
                      {JSON.stringify(result.error, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ))}
          
          {results.length === 0 && !isRunning && (
            <div className="text-center py-8 text-gray-500">
              <p>No tests have been run yet. Click "Run All Tests" to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}