from pydantic import BaseModel
from typing import Any, Dict, List, Optional

class BiasResult(BaseModel):
    score: float
    level: str
    metrics: Dict[str, Any]
    triggers: List[str]
    recommendations: List[str]
    charts: Dict[str, Any]

class AnalyzeResponse(BaseModel):
    generatedAt: str
    summary: Dict[str, Any]
    biases: Dict[str, BiasResult]
    warnings: List[str] = []