from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Data file path
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data.json')

# Initialize data structure if file doesn't exist
if not os.path.exists(DATA_FILE):
    initial_data = {
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
                        "createdAt": datetime.now().isoformat(),
                        "updatedAt": datetime.now().isoformat()
                    }
                ],
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }
        ]
    }
    with open(DATA_FILE, 'w') as f:
        json.dump(initial_data, f, indent=2)

def load_data():
    """Load data from JSON file"""
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def save_data(data):
    """Save data to JSON file"""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

# API Routes
@app.route('/api/test-sets', methods=['GET'])
def get_test_sets():
    """Get all test sets"""
    data = load_data()
    return jsonify(data['testSets'])

@app.route('/api/test-sets', methods=['POST'])
def create_test_set():
    """Create a new test set"""
    data = load_data()
    new_test_set = request.json
    
    # Generate ID if not provided
    if 'id' not in new_test_set:
        new_test_set['id'] = str(uuid.uuid4())
    
    # Set timestamps
    now = datetime.now().isoformat()
    new_test_set['createdAt'] = now
    new_test_set['updatedAt'] = now
    
    # Initialize empty test cases array if not provided
    if 'testCases' not in new_test_set:
        new_test_set['testCases'] = []
    
    data['testSets'].append(new_test_set)
    save_data(data)
    
    return jsonify(new_test_set), 201

@app.route('/api/test-sets/<test_set_id>', methods=['GET'])
def get_test_set(test_set_id):
    """Get a specific test set by ID"""
    data = load_data()
    test_set = next((ts for ts in data['testSets'] if ts['id'] == test_set_id), None)
    
    if test_set:
        return jsonify(test_set)
    else:
        return jsonify({"error": "Test set not found"}), 404

@app.route('/api/test-sets/<test_set_id>', methods=['PUT'])
def update_test_set(test_set_id):
    """Update a test set"""
    data = load_data()
    updated_test_set = request.json
    
    for i, test_set in enumerate(data['testSets']):
        if test_set['id'] == test_set_id:
            # Preserve ID and created timestamp
            updated_test_set['id'] = test_set_id
            updated_test_set['createdAt'] = test_set['createdAt']
            updated_test_set['updatedAt'] = datetime.now().isoformat()
            
            data['testSets'][i] = updated_test_set
            save_data(data)
            return jsonify(updated_test_set)
    
    return jsonify({"error": "Test set not found"}), 404

@app.route('/api/test-sets/<test_set_id>', methods=['DELETE'])
def delete_test_set(test_set_id):
    """Delete a test set"""
    data = load_data()
    
    initial_length = len(data['testSets'])
    data['testSets'] = [ts for ts in data['testSets'] if ts['id'] != test_set_id]
    
    if len(data['testSets']) < initial_length:
        save_data(data)
        return jsonify({"message": "Test set deleted successfully"})
    else:
        return jsonify({"error": "Test set not found"}), 404

@app.route('/api/test-sets/<test_set_id>/test-cases', methods=['GET'])
def get_test_cases(test_set_id):
    """Get all test cases for a test set"""
    data = load_data()
    test_set = next((ts for ts in data['testSets'] if ts['id'] == test_set_id), None)
    
    if test_set:
        return jsonify(test_set['testCases'])
    else:
        return jsonify({"error": "Test set not found"}), 404

@app.route('/api/test-sets/<test_set_id>/test-cases', methods=['POST'])
def create_test_case(test_set_id):
    """Create a new test case in a test set"""
    data = load_data()
    
    for i, test_set in enumerate(data['testSets']):
        if test_set['id'] == test_set_id:
            new_test_case = request.json
            
            # Generate ID if not provided
            if 'id' not in new_test_case:
                new_test_case['id'] = str(uuid.uuid4())
            
            # Set timestamps
            now = datetime.now().isoformat()
            new_test_case['createdAt'] = now
            new_test_case['updatedAt'] = now
            
            # Initialize empty steps array if not provided
            if 'steps' not in new_test_case:
                new_test_case['steps'] = []
            
            # Initialize empty tags array if not provided
            if 'tags' not in new_test_case:
                new_test_case['tags'] = []
            
            test_set['testCases'].append(new_test_case)
            test_set['updatedAt'] = now
            
            save_data(data)
            return jsonify(new_test_case), 201
    
    return jsonify({"error": "Test set not found"}), 404

@app.route('/api/test-sets/<test_set_id>/test-cases/<test_case_id>', methods=['GET'])
def get_test_case(test_set_id, test_case_id):
    """Get a specific test case"""
    data = load_data()
    
    test_set = next((ts for ts in data['testSets'] if ts['id'] == test_set_id), None)
    if not test_set:
        return jsonify({"error": "Test set not found"}), 404
    
    test_case = next((tc for tc in test_set['testCases'] if tc['id'] == test_case_id), None)
    if test_case:
        return jsonify(test_case)
    else:
        return jsonify({"error": "Test case not found"}), 404

@app.route('/api/test-sets/<test_set_id>/test-cases/<test_case_id>', methods=['PUT'])
def update_test_case(test_set_id, test_case_id):
    """Update a test case"""
    data = load_data()
    updated_test_case = request.json
    
    for i, test_set in enumerate(data['testSets']):
        if test_set['id'] == test_set_id:
            for j, test_case in enumerate(test_set['testCases']):
                if test_case['id'] == test_case_id:
                    # Preserve ID and created timestamp
                    updated_test_case['id'] = test_case_id
                    updated_test_case['createdAt'] = test_case['createdAt']
                    updated_test_case['updatedAt'] = datetime.now().isoformat()
                    
                    test_set['testCases'][j] = updated_test_case
                    test_set['updatedAt'] = datetime.now().isoformat()
                    
                    save_data(data)
                    return jsonify(updated_test_case)
            
            return jsonify({"error": "Test case not found"}), 404
    
    return jsonify({"error": "Test set not found"}), 404

@app.route('/api/test-sets/<test_set_id>/test-cases/<test_case_id>', methods=['DELETE'])
def delete_test_case(test_set_id, test_case_id):
    """Delete a test case"""
    data = load_data()
    
    for i, test_set in enumerate(data['testSets']):
        if test_set['id'] == test_set_id:
            initial_length = len(test_set['testCases'])
            test_set['testCases'] = [tc for tc in test_set['testCases'] if tc['id'] != test_case_id]
            
            if len(test_set['testCases']) < initial_length:
                test_set['updatedAt'] = datetime.now().isoformat()
                save_data(data)
                return jsonify({"message": "Test case deleted successfully"})
            else:
                return jsonify({"error": "Test case not found"}), 404
    
    return jsonify({"error": "Test set not found"}), 404

@app.route('/api/test-sets/<test_set_id>/lock', methods=['PUT'])
def toggle_lock_test_set(test_set_id):
    """Toggle lock status of a test set"""
    data = load_data()
    
    for i, test_set in enumerate(data['testSets']):
        if test_set['id'] == test_set_id:
            # Toggle lock status
            test_set['locked'] = not test_set.get('locked', False)
            
            # If locking, also lock all test cases
            if test_set['locked']:
                for test_case in test_set['testCases']:
                    test_case['locked'] = True
            
            test_set['updatedAt'] = datetime.now().isoformat()
            save_data(data)
            return jsonify(test_set)
    
    return jsonify({"error": "Test set not found"}), 404

@app.route('/api/test-sets/<test_set_id>/test-cases/<test_case_id>/lock', methods=['PUT'])
def toggle_lock_test_case(test_set_id, test_case_id):
    """Toggle lock status of a test case"""
    data = load_data()
    
    for test_set in data['testSets']:
        if test_set['id'] == test_set_id:
            # Cannot modify test cases if test set is locked
            if test_set.get('locked', False):
                return jsonify({"error": "Cannot modify test cases in a locked test set"}), 403
            
            for test_case in test_set['testCases']:
                if test_case['id'] == test_case_id:
                    # Toggle lock status
                    test_case['locked'] = not test_case.get('locked', False)
                    
                    test_set['updatedAt'] = datetime.now().isoformat()
                    test_case['updatedAt'] = datetime.now().isoformat()
                    
                    save_data(data)
                    return jsonify(test_case)
            
            return jsonify({"error": "Test case not found"}), 404
    
    return jsonify({"error": "Test set not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)