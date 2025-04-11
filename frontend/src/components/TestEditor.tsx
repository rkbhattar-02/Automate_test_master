import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Save, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { TestCase, TestStep } from '../types';

// Mock data for demonstration
const KEYWORDS = [
  'click',
  'type',
  'assert',
  'waitFor',
  'navigate',
  'select',
  'hover',
  'scroll',
  'dragAndDrop',
];

const OBJECTS = [
  'loginButton',
  'emailInput',
  'passwordInput',
  'submitButton',
  'errorMessage',
  'userMenu',
  'logoutButton',
];

interface TestEditorProps {
  selectedTestCase?: TestCase | null;
  onUpdateTestCase?: (testCase: TestCase) => void;
  lastSaved?: Date | null;
}

export function TestEditor({ selectedTestCase, onUpdateTestCase, lastSaved }: TestEditorProps) {
  const [testSteps, setTestSteps] = useState<string[]>([]);
  const [showKeywords, setShowKeywords] = useState(false);
  const [showObjects, setShowObjects] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const lineRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [focusedLines, setFocusedLines] = useState<Set<number>>(new Set());
  const [isDirty, setIsDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const autoSaveTimerRef = useRef<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<Map<number, string>>(new Map());
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Initialize or update test steps when a test case is selected
  useEffect(() => {
    if (selectedTestCase) {
      // If the test case has steps, convert them to strings
      // Otherwise, create a default empty step
      if (selectedTestCase.steps && selectedTestCase.steps.length > 0) {
        const steps = selectedTestCase.steps.map(step => 
          step.content || `${step.type}: ${step.action} ${JSON.stringify(step.parameters)}`
        );
        setTestSteps(steps.length > 0 ? steps : ['']);
      } else {
        setTestSteps(['']);
      }
      setIsDirty(false);
    } else {
      // Clear steps if no test case is selected
      setTestSteps([]);
      setIsDirty(false);
    }
    // Reset focused lines when test case changes
    setFocusedLines(new Set());
    // Clear validation errors
    setValidationErrors(new Map());
    setShowValidationErrors(false);
    
    // Clear any pending auto-save
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, [selectedTestCase]);

  // Update save message when lastSaved changes
  useEffect(() => {
    if (lastSaved) {
      const timeString = lastSaved.toLocaleTimeString();
      setSaveMessage(`Last saved at ${timeString}`);
      setShowSaveMessage(true);
      
      // Hide the message after 3 seconds
      const timer = window.setTimeout(() => {
        setShowSaveMessage(false);
      }, 3000);
      
      return () => window.clearTimeout(timer);
    }
  }, [lastSaved]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && selectedTestCase) {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
      
      // Set a new timer for auto-save (2 seconds after last change)
      autoSaveTimerRef.current = window.setTimeout(() => {
        saveTestCase();
      }, 2000);
      
      return () => {
        if (autoSaveTimerRef.current) {
          window.clearTimeout(autoSaveTimerRef.current);
        }
      };
    }
  }, [isDirty, testSteps, selectedTestCase]);

  // Validate test steps
  const validateTestSteps = useCallback(() => {
    const errors = new Map<number, string>();
    
    // Check if first step is empty
    if (testSteps.length > 0 && testSteps[0].trim() === '') {
      errors.set(0, 'First step cannot be empty');
    }
    
    // Check for empty steps in between
    for (let i = 1; i < testSteps.length; i++) {
      if (testSteps[i].trim() === '' && i < testSteps.length - 1 && testSteps[i+1].trim() !== '') {
        errors.set(i, 'Steps cannot be empty');
      }
    }
    
    setValidationErrors(errors);
    setShowValidationErrors(errors.size > 0);
    return errors.size === 0;
  }, [testSteps]);

  // Clean up test steps before saving
  const cleanupTestSteps = useCallback(() => {
    // Remove empty steps at the end
    let cleanedSteps = [...testSteps];
    
    // Remove trailing empty steps
    while (cleanedSteps.length > 0 && cleanedSteps[cleanedSteps.length - 1].trim() === '') {
      cleanedSteps.pop();
    }
    
    // Ensure we have at least one step
    if (cleanedSteps.length === 0) {
      cleanedSteps = [''];
    }
    
    return cleanedSteps;
  }, [testSteps]);

  const saveTestCase = useCallback(() => {
    if (!selectedTestCase || !isDirty) return;
    
    // Validate test steps
    if (!validateTestSteps()) {
      console.error('Cannot save test case with validation errors');
      return;
    }
    
    // Clean up test steps
    const cleanedSteps = cleanupTestSteps();
    
    // If steps have changed, update the state
    if (JSON.stringify(cleanedSteps) !== JSON.stringify(testSteps)) {
      setTestSteps(cleanedSteps);
    }
    
    // Convert the test steps to the TestStep format
    const updatedSteps: TestStep[] = cleanedSteps.map((step, index) => {
      // If the step is empty or just whitespace, skip it
      if (!step.trim()) {
        return {
          id: `${selectedTestCase.id}-step-${index}`,
          type: 'keyword',
          action: '',
          parameters: {},
          expected: '',
          content: step
        };
      }
      
      // Try to parse the step into components (this is a simplified version)
      let type: 'keyword' | 'function' | 'assertion' = 'keyword';
      let action = '';
      let parameters = {};
      
      if (step.includes('assert')) {
        type = 'assertion';
        action = 'assert';
        parameters = { condition: step.replace('assert', '').trim() };
      } else if (step.includes('(') && step.includes(')')) {
        type = 'function';
        action = step.split('(')[0].trim();
        parameters = { args: step.split('(')[1].split(')')[0].trim() };
      } else {
        // Default to keyword
        const parts = step.split(' ');
        action = parts[0];
        if (parts.length > 1) {
          parameters = { target: parts.slice(1).join(' ') };
        }
      }
      
      return {
        id: `${selectedTestCase.id}-step-${index}`,
        type,
        action,
        parameters,
        expected: '',
        content: step // Store the original text content
      };
    });
    
    // Create the updated test case
    const updatedTestCase: TestCase = {
      ...selectedTestCase,
      steps: updatedSteps
    };
    
    // Call the update function
    if (onUpdateTestCase) {
      onUpdateTestCase(updatedTestCase);
    }
    
    // Reset the dirty flag
    setIsDirty(false);
    // Hide validation errors after successful save
    setShowValidationErrors(false);
  }, [selectedTestCase, testSteps, isDirty, onUpdateTestCase, validateTestSteps, cleanupTestSteps]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save on Ctrl+S
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveTestCase();
        return;
      }
      
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setShowKeywords(true);
        setShowObjects(false);
        setSelectedIndex(0);
      } else if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        setShowObjects(true);
        setShowKeywords(false);
        setSelectedIndex(0);
      }

      if (showKeywords || showObjects) {
        const items = showKeywords ? KEYWORDS : OBJECTS;
        
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % items.length);
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
            break;
          case 'Enter':
            e.preventDefault();
            const selectedItem = items[selectedIndex];
            if (selectedItem) {
              insertAtCursor(selectedItem);
            }
            break;
          case 'Escape':
            e.preventDefault();
            setShowKeywords(false);
            setShowObjects(false);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showKeywords, showObjects, selectedIndex, activeLineIndex, saveTestCase]);

  const insertAtCursor = (text: string) => {
    if (activeLineIndex === null) return;
    
    const currentLine = testSteps[activeLineIndex] || '';
    const newLine = 
      currentLine.substring(0, cursorPosition) + 
      text + 
      currentLine.substring(cursorPosition);
    
    const newSteps = [...testSteps];
    newSteps[activeLineIndex] = newLine;
    setTestSteps(newSteps);
    setIsDirty(true);
    setShowKeywords(false);
    setShowObjects(false);
    
    // Calculate new cursor position
    const newPosition = cursorPosition + text.length;
    setCursorPosition(newPosition);
    
    // Update input cursor position
    requestAnimationFrame(() => {
      const input = lineRefs.current[activeLineIndex];
      if (input) {
        input.focus();
        input.setSelectionRange(newPosition, newPosition);
      }
    });
  };

  const handleLineChange = (index: number, value: string) => {
    const newSteps = [...testSteps];
    newSteps[index] = value;
    setTestSteps(newSteps);
    setIsDirty(true);
    
    // Mark this line as having been edited
    if (value.trim() !== '') {
      const newFocusedLines = new Set(focusedLines);
      newFocusedLines.add(index);
      setFocusedLines(newFocusedLines);
    }
  };

  const handleLineKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Don't allow creating a new line if the current line is empty
      if (testSteps[index].trim() === '') {
        return;
      }
      
      // Create a new line
      const newSteps = [...testSteps];
      newSteps.splice(index + 1, 0, '');
      setTestSteps(newSteps);
      setIsDirty(true);
      
      // Focus the new line
      setTimeout(() => {
        const newInput = lineRefs.current[index + 1];
        if (newInput) {
          newInput.focus();
        }
        setActiveLineIndex(index + 1);
      }, 0);
    } else if (e.key === 'Backspace' && testSteps[index] === '' && testSteps.length > 1 && index > 0) {
      // Delete empty line if backspace is pressed and it's not the first line
      e.preventDefault();
      
      const newSteps = [...testSteps];
      newSteps.splice(index, 1);
      setTestSteps(newSteps);
      setIsDirty(true);
      
      // Update focused lines
      const newFocusedLines = new Set<number>();
      focusedLines.forEach(lineIndex => {
        if (lineIndex < index) {
          newFocusedLines.add(lineIndex);
        } else if (lineIndex > index) {
          newFocusedLines.add(lineIndex - 1);
        }
      });
      setFocusedLines(newFocusedLines);
      
      // Focus the previous line
      setTimeout(() => {
        const prevInput = lineRefs.current[index - 1];
        if (prevInput) {
          prevInput.focus();
          const length = prevInput.value.length;
          prevInput.setSelectionRange(length, length);
        }
        setActiveLineIndex(index - 1);
      }, 0);
    }
  };

  const handleLineFocus = (index: number) => {
    setActiveLineIndex(index);
    setShowKeywords(false);
    setShowObjects(false);
  };

  const handleLineBlur = () => {
    // Don't reset activeLineIndex immediately to allow for keyword/object insertion
    setTimeout(() => {
      if (!showKeywords && !showObjects) {
        setActiveLineIndex(null);
      }
    }, 100);
  };

  const handleSelectionChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    setCursorPosition(input.selectionStart || 0);
  };

  const addNewLine = () => {
    // Don't allow adding a new line if the last line is empty
    if (testSteps.length > 0 && testSteps[testSteps.length - 1].trim() === '') {
      // Focus the last line instead
      setTimeout(() => {
        const lastIndex = testSteps.length - 1;
        const lastInput = lineRefs.current[lastIndex];
        if (lastInput) {
          lastInput.focus();
        }
        setActiveLineIndex(lastIndex);
      }, 0);
      return;
    }
    
    setTestSteps([...testSteps, '']);
    setIsDirty(true);
    
    // Focus the new line
    setTimeout(() => {
      const newIndex = testSteps.length;
      const newInput = lineRefs.current[newIndex];
      if (newInput) {
        newInput.focus();
      }
      setActiveLineIndex(newIndex);
    }, 0);
  };

  const handleManualSave = () => {
    // When manually saving, we want to show validation errors if there are any
    if (!validateTestSteps()) {
      setShowValidationErrors(true);
    } else {
      saveTestCase();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center text-gray-800">
            Test Case Editor
          </h2>
          <p className="text-sm text-gray-600">Press Ctrl+K for keywords, Ctrl+O for objects</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            className={`px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 ${
              !selectedTestCase ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!selectedTestCase}
          >
            <Play className="w-4 h-4" />
            Run Tests
          </button>
          <button 
            onClick={handleManualSave}
            className={`px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 ${
              !selectedTestCase || !isDirty ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!selectedTestCase || !isDirty}
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          
          {/* Save status indicator */}
          {showSaveMessage && saveMessage && (
            <div className="text-sm text-green-600 flex items-center ml-2">
              <Check className="w-4 h-4 mr-1" />
              {saveMessage}
            </div>
          )}
          
          {/* Validation error indicator */}
          {showValidationErrors && validationErrors.size > 0 && (
            <div className="text-sm text-red-600 flex items-center ml-2">
              <AlertCircle className="w-4 h-4 mr-1" />
              Fix errors before saving
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto relative">
        {!selectedTestCase ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>Select a test case to edit</p>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 relative">
              <div className="space-y-2">
                {testSteps.map((step, index) => {
                  const isActive = activeLineIndex === index;
                  const hasContent = step.trim() !== '' || focusedLines.has(index);
                  const hasError = showValidationErrors && validationErrors.has(index);
                  
                  return (
                    <div key={index} className="flex items-center">
                      {/* Step number outside the input box */}
                      <div className="w-8 flex-shrink-0 text-right pr-2 text-gray-500 font-medium">
                        {index + 1}.
                      </div>
                      <div className="flex-grow relative">
                        <input
                          ref={el => lineRefs.current[index] = el}
                          value={step}
                          onChange={(e) => handleLineChange(index, e.target.value)}
                          onKeyDown={(e) => handleLineKeyDown(e, index)}
                          onFocus={() => handleLineFocus(index)}
                          onBlur={handleLineBlur}
                          onSelect={handleSelectionChange}
                          className={`w-full p-3 font-mono text-sm border ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 ${hasError ? 'focus:ring-red-500' : 'focus:ring-primary-500'} focus:border-transparent`}
                          placeholder={hasContent ? '' : 'Type a test step...'}
                        />
                        {hasError && (
                          <div className="text-xs text-red-500 mt-1 ml-1 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {validationErrors.get(index)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                <div className="flex items-center">
                  <div className="w-8 flex-shrink-0"></div>
                  <button
                    onClick={addNewLine}
                    className={`w-full p-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 flex items-center justify-center ${
                      testSteps.length > 0 && testSteps[testSteps.length - 1].trim() === '' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={testSteps.length > 0 && testSteps[testSteps.length - 1].trim() === ''}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </button>
                </div>
              </div>
              
              {showKeywords && activeLineIndex !== null && (
                <div 
                  className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-64 z-10"
                  style={{
                    top: `${(lineRefs.current[activeLineIndex]?.offsetTop || 0) + 40}px`,
                    left: `${(lineRefs.current[activeLineIndex]?.offsetLeft || 0) + 40}px`
                  }}
                >
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Keywords (↑↓ to navigate, Enter to select)</h3>
                  <div className="space-y-1">
                    {KEYWORDS.map((keyword, index) => (
                      <button
                        key={keyword}
                        onClick={() => insertAtCursor(keyword)}
                        className={`w-full text-left p-2 text-green-600 rounded ${
                          selectedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-100'
                        }`}
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {showObjects && activeLineIndex !== null && (
                <div 
                  className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-64 z-10"
                  style={{
                    top: `${(lineRefs.current[activeLineIndex]?.offsetTop || 0) + 40}px`,
                    left: `${(lineRefs.current[activeLineIndex]?.offsetLeft || 0) + 40}px`
                  }}
                >
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Objects (↑↓ to navigate, Enter to select)</h3>
                  <div className="space-y-1">
                    {OBJECTS.map((object, index) => (
                      <button
                        key={object}
                        onClick={() => insertAtCursor(object)}
                        className={`w-full text-left p-2 text-purple-600 rounded ${
                          selectedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-100'
                        }`}
                      >
                        {object}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Reference</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><kbd className="px-2 py-1 bg-white border rounded-md">Ctrl + K</kbd> for keywords (green)</p>
                <p><kbd className="px-2 py-1 bg-white border rounded-md">Ctrl + O</kbd> for objects (purple)</p>
                <p><kbd className="px-2 py-1 bg-white border rounded-md">Ctrl + S</kbd> to save changes</p>
                <p><kbd className="px-2 py-1 bg-white border rounded-md">Enter</kbd> to add a new line</p>
                <p><kbd className="px-2 py-1 bg-white border rounded-md">Backspace</kbd> on empty line to delete it</p>
                <p><kbd className="px-2 py-1 bg-white border rounded-md">↑↓</kbd> to navigate suggestion list</p>
                <p><kbd className="px-2 py-1 bg-white border rounded-md">Enter</kbd> to select suggestion</p>
                <p><kbd className="px-2 py-1 bg-white border rounded-md">Esc</kbd> to close suggestion list</p>
              </div>
            </div>
            
            <div className="mt-4 bg-primary-50 p-4 rounded-lg border border-primary-100">
              <h3 className="text-sm font-medium text-primary-700 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Test Step Rules
              </h3>
              <div className="text-sm text-primary-700 space-y-1">
                <p>• First step cannot be empty</p>
                <p>• There cannot be empty steps in between</p>
                <p>• Empty steps at the end will be removed when saving</p>
                <p>• All steps must have content for test execution</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}