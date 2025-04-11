import React, { useState } from 'react';
import { FileText, Plus, ChevronRight, Play, Square, Trash2 } from 'lucide-react';
import type { TestSet, TestCase } from '../types';

interface TestSetListProps {
  selectedTestSet: TestSet | null;
  onSelectTestCase: (testCase: TestCase) => void;
  onCreateTestCase: () => void;
  onDeleteTestCases: (testCaseIds: Set<string>) => void;
}

export function TestSetList({ 
  selectedTestSet, 
  onSelectTestCase, 
  onCreateTestCase, 
  onDeleteTestCases
}: TestSetListProps) {
  const [selectedTestCases, setSelectedTestCases] = useState<Set<string>>(new Set());
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  if (!selectedTestSet) {
    return (
      <div className="border-r border-gray-200 w-72 p-4 bg-testlist flex items-center justify-center">
        <p className="text-gray-500">Select a test set to view cases</p>
      </div>
    );
  }

  const toggleTestCase = (id: string) => {
    const newSelected = new Set(selectedTestCases);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTestCases(newSelected);
  };

  const handleDeleteTestCases = () => {
    if (selectedTestCases.size === 0) {
      showMessage('Please select a test case');
      return;
    }
    
    // Show confirmation dialog
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteTestCases = () => {
    // Call the parent component's delete function
    onDeleteTestCases(selectedTestCases);
    
    // Show success message
    showMessage(`Deleted ${selectedTestCases.size} test case(s)`);
    
    // Clear the selection
    setSelectedTestCases(new Set());
    setShowDeleteConfirmation(false);
  };

  const cancelDeleteTestCases = () => {
    setShowDeleteConfirmation(false);
  };

  const handlePlayTestCases = () => {
    if (selectedTestCases.size === 0) {
      showMessage('Please select a test case');
      return;
    }
    
    showMessage('This will run the selected test case(s)');
  };

  const handleStopTestCases = () => {
    if (selectedTestCases.size === 0) {
      showMessage('Please select a test case');
      return;
    }
    showMessage('This will stop execution of the selected test case(s)');
  };

  const showMessage = (message: string) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  // Determine the color class based on the test set name
  const getColorClass = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('login') || lowerName.includes('auth')) {
      return 'bg-purple-light';
    } else if (lowerName.includes('user') || lowerName.includes('registration')) {
      return 'bg-teal-light';
    } else if (lowerName.includes('payment') || lowerName.includes('checkout')) {
      return 'bg-yellow-light';
    } else {
      return 'bg-mint-light';
    }
  };

  return (
    <div className="border-r border-gray-200 w-72 p-4 bg-testlist overflow-y-auto relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedTestSet.name}
        </h2>
      </div>

      <div className="bg-white p-2 rounded-lg shadow-sm mb-4">
        <div className="flex items-center justify-between gap-2">
          <button 
            onClick={onCreateTestCase}
            className="p-2 hover:bg-gray-50 rounded-full border border-gray-200 transition-colors group relative flex-1 flex items-center justify-center"
            title="New Test Case"
          >
            <Plus className="w-5 h-5 text-primary-600" />
            <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              New Test Case
            </span>
          </button>
          <button 
            onClick={handlePlayTestCases}
            className="p-2 hover:bg-gray-50 rounded-full border border-gray-200 transition-colors group relative flex-1 flex items-center justify-center"
            title="Execute Test Case"
          >
            <Play className="w-5 h-5 text-primary-600" />
            <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              Execute Test Case
            </span>
          </button>
          <button 
            onClick={handleStopTestCases}
            className="p-2 hover:bg-gray-50 rounded-full border border-gray-200 transition-colors group relative flex-1 flex items-center justify-center"
            title="Stop Execution"
          >
            <Square className="w-5 h-5 text-primary-600" />
            <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              Stop Execution
            </span>
          </button>
          <button 
            onClick={handleDeleteTestCases}
            className="p-2 hover:bg-gray-50 rounded-full border border-gray-200 transition-colors group relative flex-1 flex items-center justify-center"
            title="Delete Test Case"
          >
            <Trash2 className="w-5 h-5 text-primary-600" />
            <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              Delete Test Case
            </span>
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        {selectedTestSet.testCases.map((testCase) => {
          const colorClass = getColorClass(testCase.name);
          
          return (
            <div
              key={testCase.id}
              className="flex items-center gap-2 p-3 rounded-lg hover:bg-white transition-colors bg-white shadow-sm"
            >
              <input
                type="checkbox"
                checked={selectedTestCases.has(testCase.id)}
                onChange={() => toggleTestCase(testCase.id)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <button
                onClick={() => onSelectTestCase(testCase)}
                className="flex-1 flex items-center gap-2"
              >
                <div className={`w-2 h-full min-h-[40px] ${colorClass} rounded-l-md -ml-3`}></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    {testCase.name}
                  </div>
                  <div className="text-sm text-gray-500">{testCase.description.slice(0, 50)}...</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Popup Message */}
      {showPopup && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 transition-opacity duration-300">
          {popupMessage}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedTestCases.size} test case(s)? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDeleteTestCases}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                autoFocus
              >
                No, Cancel
              </button>
              <button
                onClick={confirmDeleteTestCases}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}