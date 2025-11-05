# AI Microservice

Python FastAPI microservice for AI-powered job matching.

## Setup

1. Create virtual environment: `python -m venv venv`
2. Activate virtual environment: `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
3. Install dependencies: `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and add your OpenAI API key
5. Run server: `uvicorn app.main:app --reload`

## Endpoints

- `POST /embed` - Generate embeddings for text
- `POST /match` - Compute similarity scores between embeddings
- `POST /feedback` - Generate feedback using GPT-4

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)

