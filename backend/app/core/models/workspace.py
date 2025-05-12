# app/core/models/workspace.py
from . import BaseModel, Field, Optional, get_current_time
from pathlib import Path

class WorkspaceConfig(BaseModel):
    """Configuration for a workspace."""
    path: Path
    name: Optional[str] = None
    git_enabled: bool = False
    git_repo_url: Optional[str] = None
    created_at: str = Field(default_factory=get_current_time)
    updated_at: str = Field(default_factory=get_current_time)
    
    @property
    def test_sets_path(self) -> Path:
        """Get the path for test sets in this workspace."""
        return self.path / "test_sets"
    
    @property
    def object_repos_path(self) -> Path:
        """Get the path for object repositories in this workspace."""
        return self.path / "object_repositories"
    
    @property
    def test_data_path(self) -> Path:
        """Get the path for test data in this workspace."""
        return self.path / "test_data"
    
    @property
    def results_path(self) -> Path:
        """Get the path for execution results in this workspace."""
        return self.path / "results"