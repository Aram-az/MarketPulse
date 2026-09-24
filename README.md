# Trading Bias Detector — QHacks

A QHacks team project that analyzes a trader's transaction history and highlights patterns associated with overtrading, loss aversion, and revenge trading. The application combines a React dashboard with a Python analysis API. An optional AI chat service uses Backboard.

> This is a prototype for exploring trading behaviour, not an automated trading system or investment advice. Its scores are heuristic indicators, not diagnoses or validated predictions.

## What it does

- Accepts a CSV or Excel file of trades and returns summary metrics, bias scores, explanations, and chart data.
- Includes synthetic example datasets for exploring different trading patterns.
- Displays the results in a React and TypeScript interface with market dashboard components.
- Includes an optional Express service for AI chat, which requires a separately configured Backboard API key.

## My contribution

I contributed to the trade-bias analysis algorithm as part of the QHacks team. The project combines work from multiple contributors; see the [original team repository](https://github.com/Gavin-Tan1/MarketPulse) for the shared code and history.

## Stack

React, TypeScript, Vite, Python, FastAPI, Polars, pandas, Node.js, and Express.

## Run locally

You will need a recent Node.js installation and Python 3. Start the analysis API and frontend in separate terminals.

### 1. Analysis API

```bash
cd bias-backend
python -m venv .venv
```

Activate the environment:

- Windows PowerShell: `.venv\Scripts\Activate.ps1`
- macOS/Linux: `source .venv/bin/activate`

Then run:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Check `http://localhost:8000/health`. Interactive API documentation is available at `http://localhost:8000/docs`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open the local address printed by Vite. The bias page uses `http://localhost:8000` by default. To change it, set `VITE_BIAS_API` in a local `frontend/.env` file.

### 3. Optional AI chat service

The trade-analysis feature runs independently of this service. To enable AI chat, configure your own Backboard account and API key locally in `backend/.env`, then set up assistant IDs using the backend's setup script:

```bash
cd backend
npm ci
node setup-assistants.js
node server.js
```

Never commit `.env`, API keys, or generated assistant IDs. The chat service listens on port 5000.

## Trade file format

The analysis API expects these columns:

`timestamp, asset, side, quantity, entry_price, exit_price, profit_loss, balance`

You can also try the included synthetic examples through the bias detector page. The API provides `GET /api/mock/list`, `POST /api/analyze`, and `POST /api/analyze/mock?name=overtrader`.

## How the analysis works

The Python service derives metrics from a trade history and uses heuristic scoring to flag possible overtrading, loss aversion, and revenge trading. Its findings depend on the completeness and quality of the uploaded records. The included example datasets are synthetic demonstrations, not evidence that the method predicts real-world returns.

## Project status

Built as a hackathon prototype. Further work would include more robust input validation, documented scoring thresholds, automated tests, and evaluation against independently labelled trade histories.
