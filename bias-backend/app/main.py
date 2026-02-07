from __future__ import annotations

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Any, Dict
import os

from .settings import settings
from .schemas import AnalyzeResponse, BiasResult
from .analysis import analyze, load_trades_from_bytes, MOCK_FILES, now_iso

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MOCK_DIR = os.path.join(BASE_DIR, "mock_data")

app = FastAPI(title="Bias Detector Backend", version="1.0.0")

origins = settings.cors_list()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health() -> Dict[str, Any]:
    return {"ok": True, "service": "bias-backend", "time": now_iso()}

@app.get("/api/mock/list")
def mock_list() -> Dict[str, Any]:
    return {"mocks": list(MOCK_FILES.keys())}

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_upload(file: UploadFile = File(...)) -> Any:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename.")

    raw = await file.read()
    max_bytes = settings.max_file_mb * 1024 * 1024
    if len(raw) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File too large. Max {settings.max_file_mb} MB.")

    try:
        loaded = load_trades_from_bytes(raw, file.filename)
        summary, biases_dict, warnings = analyze(loaded.df)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")

    biases = {k: BiasResult(**v) for k, v in biases_dict.items()}
    return AnalyzeResponse(
        generatedAt=now_iso(),
        summary=summary,
        biases=biases,
        warnings=loaded.warnings + warnings,
    )

@app.post("/api/analyze/mock", response_model=AnalyzeResponse)
async def analyze_mock(name: str = Query(...)) -> Any:
    key = (name or "").strip()
    if key not in MOCK_FILES:
        raise HTTPException(status_code=404, detail="Unknown mock name. Use /api/mock/list.")

    path = os.path.join(MOCK_DIR, MOCK_FILES[key])
    if not os.path.exists(path):
        raise HTTPException(
            status_code=500,
            detail=f"Mock CSV missing at {path}. Copy mock CSVs into app/mock_data/.",
        )

    raw = open(path, "rb").read()
    loaded = load_trades_from_bytes(raw, "mock.csv")
    summary, biases_dict, warnings = analyze(loaded.df)
    biases = {k: BiasResult(**v) for k, v in biases_dict.items()}

    return AnalyzeResponse(
        generatedAt=now_iso(),
        summary=summary,
        biases=biases,
        warnings=loaded.warnings + warnings,
    )