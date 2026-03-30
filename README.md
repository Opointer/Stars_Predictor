# Stars Predictor

Dallas Stars prediction site built with:

- `web/`: Next.js, TypeScript, Tailwind CSS, Drizzle ORM
- `pipeline/`: Python seed ingestion, feature generation, baseline predictions, and model evaluation
- `Postgres`: shared system of record for games, features, predictions, and metrics

## Local setup

1. Create a Postgres database named `stars_predictor`.
2. Copy `.env.example` values into your shell environment.
3. Run the pipeline to initialize schema and seed data.
4. Start the web app.

## Run the pipeline

```powershell
cd pipeline
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stars_predictor"
python -m src.jobs.run_pipeline
```

## Run the web app

```powershell
cd web
npm install
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stars_predictor"
npm run dev
```
