# app/core/models/execution.py
from . import BaseModel, Field, List, Dict, Optional, Any, generate_id, get_current_time
from enum import Enum

class ExecutionStatus(str, Enum):
    """Possible statuses for test execution."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    ABORTED = "aborted"

class StepResult(BaseModel):
    """Result of executing a single test step."""
    step_id: str
    status: ExecutionStatus
    output: Optional[Any] = None
    error: Optional[str] = None
    start_time: str = Field(default_factory=get_current_time)
    end_time: Optional[str] = None
    screenshot: Optional[str] = None

class TestCaseResult(BaseModel):
    """Result of executing a test case."""
    test_case_id: str
    status: ExecutionStatus
    step_results: List[StepResult] = []
    start_time: str = Field(default_factory=get_current_time)
    end_time: Optional[str] = None
    
    def add_step_result(self, result: StepResult) -> None:
        """Add a step result."""
        self.step_results.append(result)
        
        # Update overall status based on step results
        if result.status == ExecutionStatus.FAILED:
            self.status = ExecutionStatus.FAILED

class TestSetExecution(BaseModel):
    """Represents the execution of a test set."""
    id: str = Field(default_factory=generate_id)
    test_set_id: str
    status: ExecutionStatus = ExecutionStatus.PENDING
    test_case_results: Dict[str, TestCaseResult] = {}
    start_time: str = Field(default_factory=get_current_time)
    end_time: Optional[str] = None
    parameters: Dict[str, Any] = {}
    
    def add_test_case_result(self, result: TestCaseResult) -> None:
        """Add a test case result."""
        self.test_case_results[result.test_case_id] = result
        
        # Update overall status based on test case results
        if result.status == ExecutionStatus.FAILED:
            self.status = ExecutionStatus.FAILED
    
    def complete(self, status: ExecutionStatus = ExecutionStatus.COMPLETED) -> None:
        """Mark the execution as complete."""
        self.status = status
        self.end_time = get_current_time()