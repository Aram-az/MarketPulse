# Bias Detector Backend (FastAPI + Polars)

## Run
Windows:
- ./run.ps1

Mac/Linux:
- chmod +x run.sh
- ./run.sh

## Endpoints
- GET  /health
- GET  /api/mock/list
- POST /api/analyze            (multipart: file)
- POST /api/analyze/mock?name=overtrader

## Required columns
timestamp, asset, side, quantity, entry_price, exit_price, profit_loss, balance