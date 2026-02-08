from __future__ import annotations
from fastapi import FastAPI, File, UploadFile, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Any, Dict
import os
import pandas as pd
import datetime

# --- Internal Imports ---
from .settings import settings
from .schemas import AnalyzeResponse, BiasResult
from .analysis import analyze, load_trades_from_bytes, MOCK_FILES, now_iso
from .database import engine, Base, get_db
from .models import Trade

# --- Setup DB ---
Base.metadata.create_all(bind=engine)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MOCK_DIR = os.path.join(BASE_DIR, "mock_data")

app = FastAPI(title="Bias Detector Backend", version="1.0.0")

origins = settings.cors_list()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for hackathon simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- HELPER: Save DataFrame to SQLite ---
def save_dataframe_to_db(df: pd.DataFrame, filename: str, db: Session):
    try:
        # Note: We append data instead of deleting, so multiple files can be loaded
        # To clear, the user uses the /api/clear endpoint
        
        db_trades = []
        for _, row in df.iterrows():
            ts = row.get('timestamp')
            if pd.isna(ts):
                ts = datetime.datetime.now()
            else:
                try:
                    ts = pd.to_datetime(ts).to_pydatetime()
                except:
                    ts = datetime.datetime.now()

            trade = Trade(
                symbol=str(row.get('asset', 'UNK')),
                side=str(row.get('side', 'Buy')),
                quantity=float(row.get('quantity', 0)),
                entry_price=float(row.get('entry_price', 0)),
                exit_price=float(row.get('exit_price', 0)),
                pl=float(row.get('profit_loss', 0)),
                entry_date=ts,
                source_file=filename
            )
            db_trades.append(trade)

        db.bulk_save_objects(db_trades)
        db.commit()
    except Exception as e:
        print(f"Error saving to DB: {e}")
        db.rollback()

# --- ROUTES ---

@app.get("/health")
def health() -> Dict[str, Any]:
    return {"ok": True, "service": "bias-backend", "time": now_iso()}

@app.get("/api/mock/list")
def mock_list() -> Dict[str, Any]:
    return {"mocks": list(MOCK_FILES.keys())}

# Get Paginated Trades
@app.get("/api/trades")
def get_trades(
    page: int = 1, 
    limit: int = 50, 
    source: str = None,
    db: Session = Depends(get_db)
):
    offset = (page - 1) * limit
    query = db.query(Trade)
    
    if source:
        query = query.filter(Trade.source_file == source)
        
    total = query.count()
    trades = query.order_by(Trade.entry_date.desc()).offset(offset).limit(limit).all()
    
    return {
        "data": trades,
        "total": total,
        "page": page,
        "totalPages": -(-total // limit)
    }

# Get list of uploaded files
@app.get("/api/sources")
def get_sources(db: Session = Depends(get_db)):
    # Get distinct source_files
    sources = db.query(Trade.source_file).distinct().all()
    return [s[0] for s in sources if s[0]]

# Clear DB
@app.delete("/api/clear")
def clear_data(db: Session = Depends(get_db)):
    db.query(Trade).delete()
    db.commit()
    return {"message": "Data cleared"}

# Analyze & Upload
@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_upload(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
) -> Any:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename.")
    
    raw = await file.read()
    
    try:
        # 1. Load Standardized DF
        loaded = load_trades_from_bytes(raw, file.filename)
        
        # 2. Save to DB
        save_dataframe_to_db(loaded.df, file.filename, db)

        # 3. Analyze (Using the existing analysis.py logic)
        summary, biases_dict, warnings = analyze(loaded.df)
        
        # 4. Calculate Dashboard Stats from DB (Global View)
        all_trades = db.query(Trade).all()
        total_pl = sum(t.pl for t in all_trades if t.pl is not None)
        wins = [t for t in all_trades if t.pl is not None and t.pl > 0]
        win_rate = (len(wins) / len(all_trades)) * 100 if all_trades else 0
        
        # Heatmap Gen
        heatmap = [0] * 24
        for t in all_trades:
            if t.entry_date:
                heatmap[t.entry_date.hour] += 1
                
        # Trades per hour (Simple avg)
        if all_trades:
            times = [t.entry_date for t in all_trades if t.entry_date]
            if times:
                duration = (max(times) - min(times)).total_seconds() / 3600
                tph = len(all_trades) / max(duration, 1)
            else:
                tph = 0
        else:
            tph = 0

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")
    
    biases = {k: BiasResult(**v) for k, v in biases_dict.items()}
    
    # We hijack the response to include our dashboard stats in 'summary' or a new field
    # Since response_model is strict, we pack stats into 'summary' if dynamic, 
    # OR we just rely on the frontend fetching stats separately. 
    # For now, let's return the standard response and let frontend handle it.
    
    return AnalyzeResponse(
        generatedAt=now_iso(),
        summary={
            **summary, 
            "net_pl": total_pl, 
            "win_rate": win_rate, 
            "trades_per_hour": tph,
            "heatmap": heatmap # Pass heatmap array
        },
        biases=biases,
        warnings=loaded.warnings + warnings,
    )