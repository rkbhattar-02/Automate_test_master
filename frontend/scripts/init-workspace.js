import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Workspace structure
const workspaceStructure = {
  workspace: {
    'object-repository': {
      'web-objects.json': {
        version: '1.0',
        objects: {
          loginPage: {
            username: {
              type: 'input',
              locator: 'id',
              value: 'username',
              description: 'Username input field'
            },
            password: {
              type: 'input',
              locator: 'id',
              value: 'password',
              description: 'Password input field'
            },
            loginButton: {
              type: 'button',
              locator: 'id',
              value: 'login-btn',
              description: 'Login button'
            }
          }
        }
      }
    },
    'test-data': {
      'test-data.json': {
        version: '1.0',
        data: {
          users: [
            {
              username: 'testuser1',
              password: 'password123',
              role: 'admin'
            },
            {
              username: 'testuser2',
              password: 'password456',
              role: 'user'
            }
          ],
          products: [
            {
              id: 'PROD001',
              name: 'Test Product 1',
              price: 99.99
            },
            {
              id: 'PROD002',
              name: 'Test Product 2',
              price: 149.99
            }
          ]
        }
      }
    },
    'test-results': {},
    'screenshots': {},
    'reports': {}
  }
};

// Create workspace structure
async function createWorkspaceStructure(structure, basePath = projectRoot) {
  for (const [name, content] of Object.entries(structure)) {
    const fullPath = path.join(basePath, name);
    
    if (typeof content === 'object' && !Buffer.isBuffer(content)) {
      await fs.ensureDir(fullPath);
      if (Object.keys(content).length > 0) {
        await createWorkspaceStructure(content, fullPath);
      }
    } else {
      await fs.writeJSON(fullPath, content, { spaces: 2 });
    }
  }
}

// Initialize workspace
async function initWorkspace() {
  try {
    console.log('Creating workspace structure...');
    await createWorkspaceStructure(workspaceStructure);
    console.log('Workspace initialized successfully!');
  } catch (error) {
    console.error('Error initializing workspace:', error);
    process.exit(1);
  }
}

initWorkspace();