import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TestSetList } from './components/TestSetList';
import { TestEditor } from './components/TestEditor';
import { ResourceEditor } from './components/ResourceEditor';
import { Navbar } from './components/Navbar';
import type { TestSet, TestCase } from './types';
import * as testApi from './api/testApi';

function App() {
  const [testSets, setTestSets] = useState<TestSet[]>([]);
  const [selectedTestSet, setSelectedTestSet] = useState<TestSet | null>(null);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [showNewTestSetDialog, setShowNewTestSetDialog] = useState(false);
  const [showNewTestCaseDialog, setShowNewTestCaseDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [retryCount, setRetryCount] = useState(0);
  const [activeResource, setActiveResource] = useState<{ type: 'object' | 'data'; fileName: string } | null>(null);
  const maxRetries = 5;
  const retryDelay = 2000;

  useEffect(() => {
    const fetchTestSets = async () => {
      try {
        setIsLoading(true);
        const data = await testApi.getTestSets();
        setTestSets(data);
        if (data.length > 0) {
          setSelectedTestSet(data[0]);
        }
        setError(null);
        setBackendStatus('connected');
        setRetryCount(0);
      } catch (err) {
        console.error('Error fetching test sets:', 
          err instanceof Error ? err.message : 'Unknown error');
        
        if (retryCount < maxRetries) {
          setBackendStatus('connecting');
          setError(`Attempting to connect to backend server (Attempt ${retryCount + 1}/${maxRetries})...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, retryDelay);
        } else {
          setError('Failed to connect to backend server. Please ensure the server is running.');
          setBackendStatus('error');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestSets();
  }, [retryCount]);

  const handleCreateTestSet = () => {
    setNewItemName('');
    setShowNewTestSetDialog(true);
  };

  const handleCreateTestCase = () => {
    setNewItemName('');
    setShowNewTestCaseDialog(true);
  };

  const confirmTestSetCreation = async () => {
    try {
      const newTestSet = await testApi.createTestSet({
        name: newItemName || `New Test Set ${testSets.length + 1}`,
        description: 'Description of the new test set',
        testCases: []
      });
      
      setTestSets([...testSets, newTestSet]);
      setSelectedTestSet(newTestSet);
      setShowNewTestSetDialog(false);
    } catch (err) {
      console.error('Error creating test set:', 
        err instanceof Error ? err.message : 'Unknown error');
      setError('Failed to create test set');
    }
  };

  const confirmTestCaseCreation = async () => {
    if (!selectedTestSet) return;

    try {
      const newTestCase = await testApi.createTestCase(selectedTestSet.id, {
        name: newItemName || `New Test Case ${selectedTestSet.testCases.length + 1}`,
        description: 'Description of the new test case',
        steps: [],
        tags: [],
        status: 'draft'
      });

      const updatedTestSet = {
        ...selectedTestSet,
        testCases: [...selectedTestSet.testCases, newTestCase]
      };

      setTestSets(testSets.map(ts => 
        ts.id === selectedTestSet.id ? updatedTestSet : ts
      ));
      
      setSelectedTestSet(updatedTestSet);
      setSelectedTestCase(newTestCase);
      setShowNewTestCaseDialog(false);
    } catch (err) {
      console.error('Error creating test case:', 
        err instanceof Error ? err.message : 'Unknown error');
      setError('Failed to create test case');
    }
  };

  const handleDeleteTestSets = async (testSetIds: Set<string>) => {
    try {
      for (const id of testSetIds) {
        await testApi.deleteTestSet(id);
      }
      
      const newTestSets = testSets.filter(testSet => !testSetIds.has(testSet.id));
      
      if (selectedTestSet && testSetIds.has(selectedTestSet.id)) {
        setSelectedTestSet(newTestSets.length > 0 ? newTestSets[0] : null);
        setSelectedTestCase(null);
      }
      
      setTestSets(newTestSets);
    } catch (err) {
      console.error('Error deleting test sets:', 
        err instanceof Error ? err.message : 'Unknown error');
      setError('Failed to delete test sets');
    }
  };

  const handleDeleteTestCases = async (testCaseIds: Set<string>) => {
    if (!selectedTestSet) return;
    
    try {
      for (const id of testCaseIds) {
        await testApi.deleteTestCase(selectedTestSet.id, id);
      }
      
      const updatedTestCases = selectedTestSet.testCases.filter(
        testCase => !testCaseIds.has(testCase.id)
      );
      
      const updatedTestSet = {
        ...selectedTestSet,
        testCases: updatedTestCases
      };
      
      setTestSets(testSets.map(ts => 
        ts.id === selectedTestSet.id ? updatedTestSet : ts
      ));
      
      setSelectedTestSet(updatedTestSet);
      
      if (selectedTestCase && testCaseIds.has(selectedTestCase.id)) {
        setSelectedTestCase(null);
      }
    } catch (err) {
      console.error('Error deleting test cases:', 
        err instanceof Error ? err.message : 'Unknown error');
      setError('Failed to delete test cases');
    }
  };

  const handleUpdateTestCase = async (updatedTestCase: TestCase) => {
    if (!selectedTestSet) return;
    
    try {
      const savedTestCase = await testApi.updateTestCase(selectedTestSet.id, updatedTestCase);
      
      const updatedTestCases = selectedTestSet.testCases.map(tc => 
        tc.id === savedTestCase.id ? savedTestCase : tc
      );
      
      const updatedTestSet = {
        ...selectedTestSet,
        testCases: updatedTestCases
      };
      
      setTestSets(testSets.map(ts => 
        ts.id === selectedTestSet.id ? updatedTestSet : ts
      ));
      
      setSelectedTestSet(updatedTestSet);
      setSelectedTestCase(savedTestCase);
      
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error updating test case:', 
        err instanceof Error ? err.message : 'Unknown error');
      setError('Failed to save test case');
    }
  };

  const handleCreateResource = (type: 'object' | 'data', fileName: string) => {
    setActiveResource({ type, fileName });
    setSelectedTestCase(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading test data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (backendStatus === 'error') {
    return (
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center max-w-md p-6 bg-red-50 rounded-lg shadow-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-700 mb-4">Backend Connection Error</h2>
            <p className="text-gray-700 mb-4">
              Unable to connect to the backend server. Please make sure the backend server is running by executing:
            </p>
            <div className="bg-gray-800 text-white p-3 rounded text-left mb-4 font-mono text-sm">
              npm run backend
            </div>
            <p className="text-gray-700 mb-4">
              Then refresh this page to try again.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white relative">
      <Navbar />
      
      {error && (
        <div className="absolute top-16 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
          {error}
          <button 
            className="ml-2 font-bold"
            onClick={() => {
              setError(null);
              setRetryCount(0);
            }}
          >
            {retryCount < maxRetries ? 'Retry Now' : '×'}
          </button>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          testSets={testSets}
          selectedTestSet={selectedTestSet}
          onSelectTestSet={setSelectedTestSet}
          onCreateTestSet={handleCreateTestSet}
          onDeleteTestSets={handleDeleteTestSets}
          onCreateResource={handleCreateResource}
        />
        <TestSetList 
          selectedTestSet={selectedTestSet}
          onSelectTestCase={setSelectedTestCase}
          onCreateTestCase={handleCreateTestCase}
          onDeleteTestCases={handleDeleteTestCases}
        />
        {activeResource ? (
          <ResourceEditor
            type={activeResource.type}
            fileName={activeResource.fileName}
          />
        ) : (
          <TestEditor 
            selectedTestCase={selectedTestCase}
            onUpdateTestCase={handleUpdateTestCase}
            lastSaved={lastSaved}
          />
        )}
      </div>

      {showNewTestSetDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Test Set</h2>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Enter test set name"
              className="w-full p-2 border rounded mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewTestSetDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmTestSetCreation}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewTestCaseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Test Case</h2>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Enter test case name"
              className="w-full p-2 border rounded mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewTestCaseDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmTestCaseCreation}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;