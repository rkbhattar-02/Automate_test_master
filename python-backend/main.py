# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uuid
from datetime import datetime

# Initialize FastAPI app
app = FastAPI(title="Test Automation Backend")

# Configure CORS to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define TestSet model
class TestSet(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    locked: bool = False
    created_at: str
    updated_at: str

# In-memory storage for test sets
test_sets = [
    {
        "id": "1",
        "name": "Login Tests",
        "description": "Tests for user login functionality",
        "locked": False,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "2",
        "name": "Registration Tests",
        "description": "Tests for user registration",
        "locked": True,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
]

# API Endpoints
@app.get("/api/test-sets", response_model=List[Dict])
async def get_test_sets():
    """Get all test sets"""
    return test_sets

@app.get("/")
async def root():
    """Root endpoint to verify API is running"""
    return {"message": "Test Automation API is running"}

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)