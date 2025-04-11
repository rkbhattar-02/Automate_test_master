import React, { useState } from 'react';
import { Save } from 'lucide-react';

interface ResourceEditorProps {
  type: 'object' | 'data';
  fileName: string;
}

export function ResourceEditor({ type, fileName }: ResourceEditorProps) {
  const [data, setData] = useState<any>(type === 'data' ? generateEmptyTable() : generateEmptyObjectRepo());
  const [isDirty, setIsDirty] = useState(false);

  function generateEmptyTable() {
    return {
      columns: Array(10).fill('').map((_, i) => `Column ${i + 1}`),
      rows: Array(100).fill(Array(10).fill(''))
    };
  }

  function generateEmptyObjectRepo() {
    return {
      version: "1.0",
      objects: {}
    };
  }

  const handleObjectChange = (key: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      objects: {
        ...prev.objects,
        [key]: {
          ...prev.objects[key],
          [field]: value
        }
      }
    }));
    setIsDirty(true);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    setData(prev => ({
      ...prev,
      rows: prev.rows.map((row: string[], i: number) =>
        i === rowIndex ? row.map((cell: string, j: number) =>
          j === colIndex ? value : cell
        ) : row
      )
    }));
    setIsDirty(true);
  };

  const handleColumnNameChange = (index: number, value: string) => {
    setData(prev => ({
      ...prev,
      columns: prev.columns.map((col: string, i: number) =>
        i === index ? value : col
      )
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving:', data);
    setIsDirty(false);
  };

  if (type === 'object') {
    return (
      <div className="flex-1 flex flex-col bg-white">
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Object Repository Editor</h2>
            <p className="text-sm text-gray-600">{fileName}</p>
          </div>
          <button
            onClick={handleSave}
            className={`px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 ${
              !isDirty ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!isDirty}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
        <div className="p-4 flex-1 overflow-auto">
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="font-medium text-gray-700">Object Name</div>
              <div className="font-medium text-gray-700">Type</div>
              <div className="font-medium text-gray-700">Locator</div>
              <div className="font-medium text-gray-700">Value</div>
            </div>
            {Object.entries(data.objects).map(([key, obj]: [string, any]) => (
              <div key={key} className="grid grid-cols-4 gap-4">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => handleObjectChange(key, 'name', e.target.value)}
                  className="p-2 border rounded"
                  placeholder="Object Name"
                />
                <input
                  type="text"
                  value={obj.type}
                  onChange={(e) => handleObjectChange(key, 'type', e.target.value)}
                  className="p-2 border rounded"
                  placeholder="Type"
                />
                <input
                  type="text"
                  value={obj.locator}
                  onChange={(e) => handleObjectChange(key, 'locator', e.target.value)}
                  className="p-2 border rounded"
                  placeholder="Locator"
                />
                <input
                  type="text"
                  value={obj.value}
                  onChange={(e) => handleObjectChange(key, 'value', e.target.value)}
                  className="p-2 border rounded"
                  placeholder="Value"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Test Data Editor</h2>
          <p className="text-sm text-gray-600">{fileName}</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 ${
            !isDirty ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!isDirty}
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
      <div className="p-4 flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {data.columns.map((column: string, colIndex: number) => (
                <th key={colIndex} className="border p-2 bg-gray-50">
                  <input
                    type="text"
                    value={column}
                    onChange={(e) => handleColumnNameChange(colIndex, e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-none font-medium"
                    placeholder={`Column ${colIndex + 1}`}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row: string[], rowIndex: number) => (
              <tr key={rowIndex}>
                {row.map((cell: string, colIndex: number) => (
                  <td key={colIndex} className="border p-2">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      className="w-full border-none focus:outline-none"
                      placeholder="Enter value..."
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}