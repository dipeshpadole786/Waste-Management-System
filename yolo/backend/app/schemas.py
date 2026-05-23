from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class Box(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int


class Detection(BaseModel):
    label: str
    category: str
    confidence: float
    box: Box


class DetectResponse(BaseModel):
    success: bool = True
    id: int
    createdAt: datetime
    uploadUrl: str
    outputUrl: str
    counts: Dict[str, int]
    totalWasteCount: int
    humanCount: int
    cleanlinessScore: int
    status: str
    statusColor: str  # green/yellow/red
    detections: List[Detection] = Field(default_factory=list)


class HistoryItem(BaseModel):
    id: int
    createdAt: datetime
    outputUrl: str
    cleanlinessScore: int
    status: str
    statusColor: str
    counts: Dict[str, int]


class HistoryResponse(BaseModel):
    success: bool = True
    items: List[HistoryItem]

