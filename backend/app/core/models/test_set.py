# app/core/models/test_set.py
from . import BaseModel, Field, List, Optional, generate_id, get_current_time
from .test_case import TestCase

class TestSet(BaseModel):
    """Represents a collection of test cases."""
    id: str = Field(default_factory=generate_id)
    name: str
    description: Optional[str] = ""
    locked: bool = False
    test_cases: List[TestCase] = []
    created_at: str = Field(default_factory=get_current_time)
    updated_at: str = Field(default_factory=get_current_time)
    
    def add_test_case(self, test_case: TestCase) -> None:
        """Add a test case to this test set."""
        self.test_cases.append(test_case)
        self.updated_at = get_current_time()
    
    def remove_test_case(self, test_case_id: str) -> None:
        """Remove a test case from this test set."""
        self.test_cases = [tc for tc in self.test_cases if tc.id != test_case_id]
        self.updated_at = get_current_time()
    
    def toggle_lock(self) -> None:
        """Toggle the locked state of this test set."""
        self.locked = not self.locked
        self.updated_at = get_current_time()