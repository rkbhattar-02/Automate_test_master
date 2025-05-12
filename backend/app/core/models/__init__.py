# app/core/models/__init__.py
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Union, Any
from datetime import datetime
import uuid

def generate_id() -> str:
    """Generate a unique ID string."""
    return str(uuid.uuid4())

def get_current_time() -> str:
    """Get the current time in ISO format."""
    return datetime.now().isoformat()