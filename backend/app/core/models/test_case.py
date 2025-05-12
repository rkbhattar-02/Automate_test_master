# app/core/models/test_case.py
from . import BaseModel, Field, List, Optional, generate_id, get_current_time
from .test_step import TestStep

class TestCase(BaseModel):
    """Represents a test case with steps."""
    id: str = Field(default_factory=generate_id)
    name: str
    description: Optional[str] = ""
    steps: List[TestStep] = []
    enabled: bool = True
    created_at: str = Field(default_factory=get_current_time)
    updated_at: str = Field(default_factory=get_current_time)
    
    def add_step(self, step: TestStep) -> None:
        """Add a step to this test case."""
        self.steps.append(step)
        self.updated_at = get_current_time()
    
    def remove_step(self, step_id: str) -> None:
        """Remove a step from this test case."""
        self.steps = [s for s in self.steps if s.id != step_id]
        self.updated_at = get_current_time()
    
    def reorder_steps(self, step_ids: List[str]) -> None:
        """Reorder steps based on the provided list of IDs."""
        if len(step_ids) != len(self.steps):
            raise ValueError("Step ID list must match current steps")
            
        # Create a map of id -> step
        step_map = {step.id: step for step in self.steps}
        
        # Reorder steps based on the provided IDs
        self.steps = [step_map[id] for id in step_ids if id in step_map]
        self.updated_at = get_current_time()