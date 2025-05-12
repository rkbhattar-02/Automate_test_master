# app/core/models/test_step.py
from . import BaseModel, Field, Dict, Optional, Any, generate_id, get_current_time

class TestStep(BaseModel):
    """Represents a single step in a test case."""
    id: str = Field(default_factory=generate_id)
    description: str
    action_type: Optional[str] = None
    target_object: Optional[str] = None
    parameters: Dict[str, Any] = {}
    generated_code: Optional[str] = None
    natural_language: str
    created_at: str = Field(default_factory=get_current_time)
    updated_at: str = Field(default_factory=get_current_time)