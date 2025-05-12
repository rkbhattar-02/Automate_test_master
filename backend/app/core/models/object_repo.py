# app/core/models/object_repo.py
from . import BaseModel, Field, List, Dict, Optional, generate_id, get_current_time

class ObjectLocator(BaseModel):
    """Represents a method to locate an element."""
    type: str  # css, xpath, id, etc.
    value: str
    reliability: int = 5  # 1-10 scale

class ObjectDefinition(BaseModel):
    """Represents a UI element in the object repository."""
    id: str = Field(default_factory=generate_id)
    name: str
    primary_locator: ObjectLocator
    alternative_locators: List[ObjectLocator] = []
    attributes: Dict[str, str] = {}
    screenshot: Optional[str] = None
    tags: List[str] = []
    created_at: str = Field(default_factory=get_current_time)
    updated_at: str = Field(default_factory=get_current_time)

class ObjectRepository(BaseModel):
    """Represents a collection of object definitions."""
    id: str = Field(default_factory=generate_id)
    name: str
    description: Optional[str] = ""
    objects: Dict[str, ObjectDefinition] = {}
    created_at: str = Field(default_factory=get_current_time)
    updated_at: str = Field(default_factory=get_current_time)
    
    def add_object(self, object_def: ObjectDefinition) -> None:
        """Add an object to this repository."""
        self.objects[object_def.name] = object_def
        self.updated_at = get_current_time()
    
    def remove_object(self, object_name: str) -> None:
        """Remove an object from this repository."""
        if object_name in self.objects:
            del self.objects[object_name]
            self.updated_at = get_current_time()
    
    def get_object(self, object_name: str) -> Optional[ObjectDefinition]:
        """Get an object by name."""
        return self.objects.get(object_name)