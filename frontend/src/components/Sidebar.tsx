import React, { useState, useEffect } from 'react';
import { FolderTree, GitBranch, Settings, Play, Plus, Square, Trash2, Lock, Github as Git, Construction } from 'lucide-react';
import type { TestSet } from '../types';
import { getTestSets, createTestSet, deleteTestSet, toggleLockTestSet } from '../api/testApi'; //toggleTestSetLock

interface SidebarProps {
  testSets: TestSet[]; // Add this line
  selectedTestSet: TestSet | null;
  onSelectTestSet: (testSet: TestSet) => void;
  onCreateTestSet: () => void; // Add other missing props
  onDeleteTestSets: (testSetIds: Set<string>) => Promise<void>;
  onCreateResource: (type: "object" | "data", fileName: string) => void;

}

export function Sidebar({ 
  selectedTestSet, 
  onSelectTestSet, 
}: SidebarProps) {
  const [testSets, setTestSets] = useState<TestSet[]>([]);
  const [selectedTestSets, setSelectedTestSets] = useState<Set<string>>(new Set());
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Fetch test sets from the backend
    const loadTestSets = async () => {
      setIsLoading(true);
      try {
        const data = await getTestSets();
        console.log('Loaded test sets:', data);
        setTestSets(data);
      } catch (error) {
        console.error('Error fetching test sets:', error);
        showMessage('Failed to load test sets');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTestSets();
  }, []);

  const handleCreateTestSet = async () => {
    try {
      const newTestSetData = {
        name: 'New Test Set',
        description: 'Description for the new test set',
      };
      
      const createdTestSet = await createTestSet(newTestSetData);
      setTestSets([...testSets, createdTestSet]);
      showMessage('Test set created successfully');
    } catch (error) {
      console.error('Error creating test set:', error);
      showMessage('Failed to create test set');
    }
  };

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
    
    // Check if any of the selected test sets are locked
    const hasLockedTestSets = Array.from(selectedTestSets).some(id => {
      const testSet = testSets.find(ts => ts.id === id);
      return testSet?.locked;
    });
    
    if (hasLockedTestSets) {
      showMessage('Cannot delete locked test sets');
      return;
    }
    
    // Show confirmation dialog
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteTestSets = async () => {
    try {
      setIsLoading(true);
      for (const id of selectedTestSets) {
        await deleteTestSet(id);
      }
      
      // Remove deleted test sets from state
      setTestSets(testSets.filter(ts => !selectedTestSets.has(ts.id)));
      showMessage(`Deleted ${selectedTestSets.size} test set(s)`);
      
      // Clear the selection
      setSelectedTestSets(new Set());
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error('Error deleting test sets:', error);
      showMessage('Failed to delete test set(s)');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDeleteTestSets = () => {
    setShowDeleteConfirmation(false);
  };

  const handlePlayTestSets = () => {
    if (selectedTestSets.size === 0) {
      showMessage('Please select a test set');
      return;
    }
    
    // Check if any of the selected test sets are locked
    const hasLockedTestSets = Array.from(selectedTestSets).some(id => {
      const testSet = testSets.find(ts => ts.id === id);
      return testSet?.locked;
    });
    
    if (hasLockedTestSets) {
      showMessage('Cannot execute locked test sets');
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

  const handleLockTestSets = async () => {
    if (selectedTestSets.size === 0) {
      showMessage('Please select a test set');
      return;
    }
  
    try {
      setIsLoading(true);
      // Determine if all selected test sets were locked before toggling
      const allLocked = Array.from(selectedTestSets).every(id => {
        const testSet = testSets.find(ts => ts.id === id);
        return testSet?.locked;
      });
      
      for (const id of selectedTestSets) {
        const result = await toggleLockTestSet(id);
        
        // Update test set in state
        setTestSets(testSets.map(ts => 
          ts.id === id ? { ...ts, locked: result.locked } : ts
        ));
      }
      
      showMessage(`${allLocked ? 'Unlocked' : 'Locked'} the selected test set(s)`);
      
      // If we're locking, uncheck the test sets
      if (!allLocked) {
        setSelectedTestSets(new Set());
      }
    } catch (error) {
      console.error('Error toggling test set lock:', error);
      showMessage('Failed to update test set lock status');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (message: string) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000); // Hide popup after 3 seconds
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col relative">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FolderTree className="w-6 h-6" />
          Test Manager
        </h1>
      </div>
      
      <div className="flex-1 p-4">
        <div className="bg-gray-800 p-2 rounded-lg mb-4">
          <div className="flex items-center justify-between gap-2">
            <button 
              onClick={handleCreateTestSet}
              className="p-2 hover:bg-gray-700 rounded-full border border-gray-600 transition-colors group relative flex-1 flex items-center justify-center"
              title="New Test Set"
              disabled={isLoading}
            >
              <Plus className="w-5 h-5" />
              <span className="absolute hidden group-hover:block bg-gray-900 text-white text-xs py-1 px-2 rounded -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                New Test Set
              </span>
            </button>
            <button 
              onClick={handlePlayTestSets}
              className="p-2 hover:bg-gray-700 rounded-full border border-gray-600 transition-colors group relative flex-1 flex items-center justify-center"
              title="Execute Test Set"
              disabled={isLoading}
            >
              <Play className="w-5 h-5" />
              <span className="absolute hidden group-hover:block bg-gray-900 text-white text-xs py-1 px-2 rounded -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Execute Test Set
              </span>
            </button>
            <button 
              onClick={handleStopTestSets}
              className="p-2 hover:bg-gray-700 rounded-full border border-gray-600 transition-colors group relative flex-1 flex items-center justify-center"
              title="Stop Execution"
              disabled={isLoading}
            >
              <Square className="w-5 h-5" />
              <span className="absolute hidden group-hover:block bg-gray-900 text-white text-xs py-1 px-2 rounded -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Stop Execution
              </span>
            </button>
            <button 
              onClick={handleDeleteTestSets}
              className="p-2 hover:bg-gray-700 rounded-full border border-gray-600 transition-colors group relative flex-1 flex items-center justify-center"
              title="Delete Test Set"
              disabled={isLoading}
            >
              <Trash2 className="w-5 h-5" />
              <span className="absolute hidden group-hover:block bg-gray-900 text-white text-xs py-1 px-2 rounded -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Delete Test Set
              </span>
            </button>
            <button 
              onClick={handleLockTestSets}
              className="p-2 hover:bg-gray-700 rounded-full border border-gray-600 transition-colors group relative flex-1 flex items-center justify-center"
              title="Lock/Unlock Test Set"
              disabled={isLoading}
            >
              <Lock className="w-5 h-5" />
              <span className="absolute hidden group-hover:block bg-gray-900 text-white text-xs py-1 px-2 rounded -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Lock/Unlock Test Set
              </span>
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="space-y-1">
            {testSets.map((testSet) => (
              <div
                key={testSet.id}
                className={`flex items-center gap-2 p-2 rounded transition-colors ${
                  selectedTestSet?.id === testSet.id ? 'bg-gray-700' : 'hover:bg-gray-800'
                } ${testSet.locked ? 'opacity-60' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedTestSets.has(testSet.id)}
                  onChange={() => toggleTestSet(testSet.id)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                <button
                  onClick={() => onSelectTestSet(testSet)}
                  className="flex-1 flex items-center gap-2 text-left"
                  disabled={testSet.locked}
                >
                  <FolderTree className="w-4 h-4" />
                  <span className={testSet.locked ? 'line-through' : ''}>
                    {testSet.name}
                  </span>
                  {testSet.locked && (
                    <Lock className="w-3 h-3 ml-1 text-gray-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        <nav className="space-y-2 mt-8">
          <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-800">
            <Play className="w-4 h-4" />
            Test Runner
          </a>
          <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-800">
            <Git className="w-4 h-4" />
            Commit to Git
          </a>
          <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-800">
            <Construction className="w-4 h-4" />
            Run Jenkins Build
          </a>
          <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-800">
            <Settings className="w-4 h-4" />
            Settings
          </a>
        </nav>
      </div>

      {/* Popup Message */}
      {showPopup && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg border border-gray-700 transition-opacity duration-300">
          {popupMessage}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-96 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Confirm Deletion</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete {selectedTestSets.size} test set(s)? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDeleteTestSets}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none"
                autoFocus
              >
                No, Cancel
              </button>
              <button
                onClick={confirmDeleteTestSets}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none"
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