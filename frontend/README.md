# Test Manager Application

A comprehensive test management application with a React frontend and Node.js Express backend.

## Features

- Create, edit, and manage test sets and test cases
- Interactive test case editor with auto-save functionality
- Lock/unlock test sets and test cases to prevent modifications
- Persistent storage of test data using a Node.js backend
- Real-time status updates and error handling

## Project Structure

- `src/` - React frontend code
  - `components/` - React components
  - `api/` - API client for backend communication
  - `types.ts` - TypeScript type definitions
- `backend/` - Node.js Express backend
  - `server.js` - Main Express application
  - `data.json` - JSON file for data storage

## Getting Started

### Prerequisites

- Node.js 14+

### Installation

1. Install dependencies:
   ```
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   npm run backend
   ```

2. In a separate terminal, start the frontend development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:5173)

## API Endpoints

### Test Sets

- `GET /api/test-sets` - Get all test sets
- `POST /api/test-sets` - Create a new test set
- `GET /api/test-sets/:id` - Get a specific test set
- `PUT /api/test-sets/:id` - Update a test set
- `DELETE /api/test-sets/:id` - Delete a test set
- `PUT /api/test-sets/:id/lock` - Toggle lock status of a test set

### Test Cases

- `GET /api/test-sets/:id/test-cases` - Get all test cases for a test set
- `POST /api/test-sets/:id/test-cases` - Create a new test case
- `GET /api/test-sets/:id/test-cases/:caseId` - Get a specific test case
- `PUT /api/test-sets/:id/test-cases/:caseId` - Update a test case
- `DELETE /api/test-sets/:id/test-cases/:caseId` - Delete a test case
- `PUT /api/test-sets/:id/test-cases/:caseId/lock` - Toggle lock status of a test case