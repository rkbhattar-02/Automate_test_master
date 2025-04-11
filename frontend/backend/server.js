import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Data file paths
const DATA_FILE = path.join(__dirname, 'data.json');
const WORKSPACE_DIR = path.join(__dirname, '..', 'workspace');
const OBJECT_REPO_FILE = path.join(WORKSPACE_DIR, 'object-repository', 'web-objects.json');
const TEST_DATA_FILE = path.join(WORKSPACE_DIR, 'test-data', 'test-data.json');

// Initialize workspace if it doesn't exist
if (!fs.existsSync(WORKSPACE_DIR)) {
  const initScript = spawn('node', ['scripts/init-workspace.js'], {
    cwd: path.join(__dirname, '..')
  });

  initScript.stdout.on('data', (data) => {
    console.log(`Init script: ${data}`);
  });

  initScript.stderr.on('data', (data) => {
    console.error(`Init script error: ${data}`);
  });
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  const initial_data = {
    "testSets": [
      {
        "id": "1",
        "name": "Login Flow Tests",
        "description": "Test cases for user authentication",
        "testCases": [
          {
            "id": "1",
            "name": "Valid Login",
            "description": "Test successful login with valid credentials",
            "steps": [],
            "tags": ["authentication", "smoke-test"],
            "status": "ready",
            "createdAt": new Date().toISOString(),
            "updatedAt": new Date().toISOString()
          }
        ],
        "createdAt": new Date().toISOString(),
        "updatedAt": new Date().toISOString()
      }
    ]
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(initial_data, null, 2));
}

// Helper functions
const loadData = () => {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
};

const saveData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Workspace API Routes
app.get('/api/workspace/object-repository', (req, res) => {
  try {
    const data = fs.readJSONSync(OBJECT_REPO_FILE);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read object repository' });
  }
});

app.put('/api/workspace/object-repository', (req, res) => {
  try {
    fs.writeJSONSync(OBJECT_REPO_FILE, req.body, { spaces: 2 });
    res.json(req.body);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update object repository' });
  }
});

app.get('/api/workspace/test-data', (req, res) => {
  try {
    const data = fs.readJSONSync(TEST_DATA_FILE);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read test data' });
  }
});

app.put('/api/workspace/test-data', (req, res) => {
  try {
    fs.writeJSONSync(TEST_DATA_FILE, req.body, { spaces: 2 });
    res.json(req.body);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update test data' });
  }
});

// Test Set API Routes
app.get('/api/test-sets', (req, res) => {
  const data = loadData();
  res.json(data.testSets);
});

app.post('/api/test-sets', (req, res) => {
  const data = loadData();
  const newTestSet = req.body;
  
  if (!newTestSet.id) {
    newTestSet.id = Date.now().toString();
  }
  
  const now = new Date().toISOString();
  newTestSet.createdAt = now;
  newTestSet.updatedAt = now;
  
  if (!newTestSet.testCases) {
    newTestSet.testCases = [];
  }
  
  data.testSets.push(newTestSet);
  saveData(data);
  
  res.status(201).json(newTestSet);
});

app.get('/api/test-sets/:testSetId', (req, res) => {
  const data = loadData();
  const testSet = data.testSets.find(ts => ts.id === req.params.testSetId);
  
  if (testSet) {
    res.json(testSet);
  } else {
    res.status(404).json({ error: "Test set not found" });
  }
});

app.put('/api/test-sets/:testSetId', (req, res) => {
  const data = loadData();
  const updatedTestSet = req.body;
  
  for (let i = 0; i < data.testSets.length; i++) {
    if (data.testSets[i].id === req.params.testSetId) {
      updatedTestSet.id = req.params.testSetId;
      updatedTestSet.createdAt = data.testSets[i].createdAt;
      updatedTestSet.updatedAt = new Date().toISOString();
      
      data.testSets[i] = updatedTestSet;
      saveData(data);
      return res.json(updatedTestSet);
    }
  }
  
  res.status(404).json({ error: "Test set not found" });
});

app.delete('/api/test-sets/:testSetId', (req, res) => {
  const data = loadData();
  
  const initialLength = data.testSets.length;
  data.testSets = data.testSets.filter(ts => ts.id !== req.params.testSetId);
  
  if (data.testSets.length < initialLength) {
    saveData(data);
    res.json({ message: "Test set deleted successfully" });
  } else {
    res.status(404).json({ error: "Test set not found" });
  }
});

// Test Case API Routes
app.get('/api/test-sets/:testSetId/test-cases', (req, res) => {
  const data = loadData();
  const testSet = data.testSets.find(ts => ts.id === req.params.testSetId);
  
  if (testSet) {
    res.json(testSet.testCases);
  } else {
    res.status(404).json({ error: "Test set not found" });
  }
});

app.post('/api/test-sets/:testSetId/test-cases', (req, res) => {
  const data = loadData();
  
  for (let i = 0; i < data.testSets.length; i++) {
    if (data.testSets[i].id === req.params.testSetId) {
      const newTestCase = req.body;
      
      if (!newTestCase.id) {
        newTestCase.id = Date.now().toString();
      }
      
      const now = new Date().toISOString();
      newTestCase.createdAt = now;
      newTestCase.updatedAt = now;
      
      if (!newTestCase.steps) {
        newTestCase.steps = [];
      }
      
      if (!newTestCase.tags) {
        newTestCase.tags = [];
      }
      
      data.testSets[i].testCases.push(newTestCase);
      data.testSets[i].updatedAt = now;
      
      saveData(data);
      return res.status(201).json(newTestCase);
    }
  }
  
  res.status(404).json({ error: "Test set not found" });
});

app.get('/api/test-sets/:testSetId/test-cases/:testCaseId', (req, res) => {
  const data = loadData();
  
  const testSet = data.testSets.find(ts => ts.id === req.params.testSetId);
  if (!testSet) {
    return res.status(404).json({ error: "Test set not found" });
  }
  
  const testCase = testSet.testCases.find(tc => tc.id === req.params.testCaseId);
  if (testCase) {
    res.json(testCase);
  } else {
    res.status(404).json({ error: "Test case not found" });
  }
});

app.put('/api/test-sets/:testSetId/test-cases/:testCaseId', (req, res) => {
  const data = loadData();
  const updatedTestCase = req.body;
  
  for (let i = 0; i < data.testSets.length; i++) {
    if (data.testSets[i].id === req.params.testSetId) {
      for (let j = 0; j < data.testSets[i].testCases.length; j++) {
        if (data.testSets[i].testCases[j].id === req.params.testCaseId) {
          updatedTestCase.id = req.params.testCaseId;
          updatedTestCase.createdAt = data.testSets[i].testCases[j].createdAt;
          updatedTestCase.updatedAt = new Date().toISOString();
          
          data.testSets[i].testCases[j] = updatedTestCase;
          data.testSets[i].updatedAt = new Date().toISOString();
          
          saveData(data);
          return res.json(updatedTestCase);
        }
      }
      
      return res.status(404).json({ error: "Test case not found" });
    }
  }
  
  res.status(404).json({ error: "Test set not found" });
});

app.delete('/api/test-sets/:testSetId/test-cases/:testCaseId', (req, res) => {
  const data = loadData();
  
  for (let i = 0; i < data.testSets.length; i++) {
    if (data.testSets[i].id === req.params.testSetId) {
      const initialLength = data.testSets[i].testCases.length;
      data.testSets[i].testCases = data.testSets[i].testCases.filter(
        tc => tc.id !== req.params.testCaseId
      );
      
      if (data.testSets[i].testCases.length < initialLength) {
        data.testSets[i].updatedAt = new Date().toISOString();
        saveData(data);
        return res.json({ message: "Test case deleted successfully" });
      } else {
        return res.status(404).json({ error: "Test case not found" });
      }
    }
  }
  
  res.status(404).json({ error: "Test set not found" });
});

// Lock/Unlock API Routes
app.put('/api/test-sets/:testSetId/lock', (req, res) => {
  const data = loadData();
  
  for (let i = 0; i < data.testSets.length; i++) {
    if (data.testSets[i].id === req.params.testSetId) {
      data.testSets[i].locked = !data.testSets[i].locked;
      
      if (data.testSets[i].locked) {
        data.testSets[i].testCases.forEach(testCase => {
          testCase.locked = true;
        });
      }
      
      data.testSets[i].updatedAt = new Date().toISOString();
      saveData(data);
      return res.json(data.testSets[i]);
    }
  }
  
  res.status(404).json({ error: "Test set not found" });
});

app.put('/api/test-sets/:testSetId/test-cases/:testCaseId/lock', (req, res) => {
  const data = loadData();
  
  for (let i = 0; i < data.testSets.length; i++) {
    if (data.testSets[i].id === req.params.testSetId) {
      if (data.testSets[i].locked) {
        return res.status(403).json({ error: "Cannot modify test cases in a locked test set" });
      }
      
      for (let j = 0; j < data.testSets[i].testCases.length; j++) {
        if (data.testSets[i].testCases[j].id === req.params.testCaseId) {
          data.testSets[i].testCases[j].locked = !data.testSets[i].testCases[j].locked;
          
          data.testSets[i].updatedAt = new Date().toISOString();
          data.testSets[i].testCases[j].updatedAt = new Date().toISOString();
          
          saveData(data);
          return res.json(data.testSets[i].testCases[j]);
        }
      }
      
      return res.status(404).json({ error: "Test case not found" });
    }
  }
  
  res.status(404).json({ error: "Test set not found" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});