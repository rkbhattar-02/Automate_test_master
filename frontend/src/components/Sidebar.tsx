import React, { useState } from 'react';
import { FolderTree, Settings, Play, Plus, Square, Trash2, Github as Git, ChevronDown, ChevronRight, Database, FileJson } from 'lucide-react';
import type { TestSet } from '../types';

interface SidebarProps {
  testSets: TestSet[];
  selectedTestSet: TestSet | null;
  onSelectTestSet: (testSet: TestSet) => void;
  onCreateTestSet: () => void;
  onDeleteTestSets: (testSetIds: Set<string>) => void;
  onCreateResource: (type: 'object' | 'data', fileName: string) => void;
}

export function Sidebar({ 
  testSets, 
  selectedTestSet, 
  onSelectTestSet, 
  onCreateTestSet, 
  onDeleteTestSets,
  onCreateResource
}: SidebarProps) {
  const [selectedTestSets, setSelectedTestSets] = useState<Set<string>>(new Set());
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isResourcesExpanded, setIsResourcesExpanded] = useState(false);
  const [showNewResourceDialog, setShowNewResourceDialog] = useState(false);
  const [newResourceType, setNewResourceType] = useState<'object' | 'data' | null>(null);

  const toggleTestSet = (id: string) => {
    const newSelected = new Set(selectedTestSets);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTestSets(newSelected);
  };

  const handleDeleteTestSets = () => {
    if (selectedTestSets.size === 0) {
      showMessage('Please select a test set');
      return;
    }
    
    // Show confirmation dialog
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteTestSets = () => {
    // Call the parent component's delete function
    onDeleteTestSets(selectedTestSets);
    
    // Show success message
    showMessage(`Deleted ${selectedTestSets.size} test set(s)`);
    
    // Clear the selection
    setSelectedTestSets(new Set());
    setShowDeleteConfirmation(false);
  };

  const cancelDeleteTestSets = () => {
    setShowDeleteConfirmation(false);
  };

  const handlePlayTestSets = () => {
    if (selectedTestSets.size === 0) {
      showMessage('Please select a test set');
      return;
    }
    
    showMessage('This will run the selected test set(s)');
  };

  const handleStopTestSets = () => {
    if (selectedTestSets.size === 0) {
      showMessage('Please select a test set');
      return;
    }
    showMessage('This will stop execution of the selected test set(s)');
  };

  const showMessage = (message: string) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const handleCreateResource = (type: 'object' | 'data') => {
    setNewResourceType(type);
    setShowNewResourceDialog(true);
  };

  const confirmResourceCreation = () => {
    const fileName = (document.querySelector('input[placeholder="Enter file name"]') as HTMLInputElement)?.value || 
      `new-${newResourceType === 'object' ? 'object-repo' : 'test-data'}.json`;
    
    onCreateResource(newResourceType!, fileName);
    setShowNewResourceDialog(false);
    setNewResourceType(null);
  };

  return (
    <div className="w-64 bg-white text-gray-800 h-screen flex flex-col relative border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <FolderTree className="w-6 h-6 text-primary-600" />
          Test Manager
        </h1>
      </div>
      
      <div className="flex-1 p-4 bg-sidebar overflow-y-auto">
        <div className="bg-white p-2 rounded-lg shadow-sm mb-4">
          <div className="flex items-center justify-between gap-2">
            <button 
              onClick={onCreateTestSet}
              className="p-2 hover:bg-gray-50 rounded-full border border-gray-200 transition-colors group relative flex-1 flex items-center justify-center"
              title="New Test Set"
            >
              <Plus className="w-5 h-5 text-primary-600" />
              <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                New Test Set
              </span>
            </button>
            <button 
              onClick={handlePlayTestSets}
              className="p-2 hover:bg-gray-50 rounded-full border border-gray-200 transition-colors group relative flex-1 flex items-center justify-center"
              title="Execute Test Set"
            >
              <Play className="w-5 h-5 text-primary-600" />
              <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Execute Test Set
              </span>
            </button>
            <button 
              onClick={handleStopTestSets}
              className="p-2 hover:bg-gray-50 rounded-full border border-gray-200 transition-colors group relative flex-1 flex items-center justify-center"
              title="Stop Execution"
            >
              <Square className="w-5 h-5 text-primary-600" />
              <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Stop Execution
              </span>
            </button>
            <button 
              onClick={handleDeleteTestSets}
              className="p-2 hover:bg-gray-50 rounded-full border border-gray-200 transition-colors group relative flex-1 flex items-center justify-center"
              title="Delete Test Set"
            >
              <Trash2 className="w-5 h-5 text-primary-600" />
              <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Delete Test Set
              </span>
            </button>
          </div>
        </div>
        
        <div className="space-y-1 mb-6">
          {testSets.map((testSet) => (
            <div
              key={testSet.id}
              className={`flex items-center gap-2 p-2 rounded transition-colors ${
                selectedTestSet?.id === testSet.id ? 'bg-primary-50' : 'hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedTestSets.has(testSet.id)}
                onChange={() => toggleTestSet(testSet.id)}
                className="w-4 h-4 rounded border-gray-300 bg-white text-primary-600 focus:ring-primary-500 focus:ring-offset-gray-100"
              />
              <button
                onClick={() => onSelectTestSet(testSet)}
                className="flex-1 flex items-center gap-2 text-left"
              >
                <FolderTree className="w-4 h-4 text-primary-500" />
                <span>{testSet.name}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Resources Section */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setIsResourcesExpanded(!isResourcesExpanded)}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded text-gray-700 font-medium"
          >
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Resources
            </span>
            {isResourcesExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {isResourcesExpanded && (
            <div className="ml-4 mt-2 space-y-2">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded group">
                <span className="flex items-center gap-2 text-gray-600">
                  <FileJson className="w-4 h-4" />
                  Object Repository
                </span>
                <button
                  onClick={() => handleCreateResource('object')}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                >
                  <Plus className="w-4 h-4 text-primary-600" />
                </button>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded group">
                <span className="flex items-center gap-2 text-gray-600">
                  <Database className="w-4 h-4" />
                  Test Data
                </span>
                <button
                  onClick={() => handleCreateResource('data')}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                >
                  <Plus className="w-4 h-4 text-primary-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className="space-y-2 mt-8">
          <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 text-gray-600">
            <Git className="w-4 h-4" />
            Commit to Git
          </a>
          <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 text-gray-600">
            <Settings className="w-4 h-4" />
            Settings
          </a>
        </nav>
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
              Are you sure you want to delete {selectedTestSets.size} test set(s)? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDeleteTestSets}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                autoFocus
              >
                No, Cancel
              </button>
              <button
                onClick={confirmDeleteTestSets}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Resource Dialog */}
      {showNewResourceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-semibold mb-4">
              Create New {newResourceType === 'object' ? 'Object Repository' : 'Test Data'} File
            </h2>
            <input
              type="text"
              placeholder="Enter file name"
              className="w-full p-2 border rounded mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNewResourceDialog(false);
                  setNewResourceType(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmResourceCreation}
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