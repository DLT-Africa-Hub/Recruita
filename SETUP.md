# Setup Guide

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.10+ (for local AI service development)
- OpenAI API key
- Git (for Husky hooks)

## Initial Setup

### 1. Install Root Dependencies

```bash
# Install Husky, Commitlint, and lint-staged
npm install
```

This will automatically set up Husky git hooks via the `prepare` script.

### 2. Verify Git Hooks

```bash
# Check that hooks are installed
ls -la .husky/
```

You should see:
- `pre-commit` - Runs linting and formatting before commits
- `commit-msg` - Validates commit messages

## Quick Start with Docker

1. **Clone/Navigate to the project directory**

2. **Set up environment variables**
   - Create `.env` in the root directory with your OpenAI API key:
     ```
     OPENAI_API_KEY=your-openai-api-key-here
     ```
   - Create `backend/.env` from `backend/.env.example` (copy manually if needed):
     ```
     PORT=3000
     NODE_ENV=development
     MONGODB_URI=mongodb://admin:password@mongodb:27017/talent-hub?authSource=admin
     JWT_SECRET=your-super-secret-jwt-key-change-in-production
     JWT_EXPIRE=7d
     AI_SERVICE_URL=http://ai-service:8000
     CORS_ORIGIN=http://localhost:5173
     ```
   - Create `ai-service/.env` from `ai-service/.env.example`:
     ```
     OPENAI_API_KEY=your-openai-api-key-here
     PORT=8000
     HOST=0.0.0.0
     ```

3. **Start all services**
   ```bash
   cd infrastructure
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - AI Service: http://localhost:8000
   - MongoDB: localhost:27017

5. **View logs**
   ```bash
   docker-compose logs -f
   ```

6. **Stop services**
   ```bash
   docker-compose down
   ```

## Local Development (without Docker)

### Backend

```bash
cd backend
npm install
# Create .env file
npm run dev
```

### AI Service

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create .env file
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
# Create .env file if needed
npm run dev
```

## Project Structure

```
talent-hub/
├── backend/              # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic (AI service client)
│   │   ├── middleware/   # Auth middleware
│   │   └── utils/        # Helper functions
│   └── Dockerfile
├── ai-service/           # Python FastAPI
│   ├── app/
│   │   ├── main.py       # FastAPI app
│   │   ├── embeddings.py # OpenAI embedding generation
│   │   ├── matcher.py    # Similarity matching
│   │   └── feedback.py   # GPT-4 feedback generation
│   └── Dockerfile
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── api/          # API client
│   │   ├── context/      # React context (Auth)
│   │   └── hooks/        # Custom hooks (future)
│   └── Dockerfile
└── infrastructure/       # Docker configuration
    ├── docker-compose.yml
    └── init_mongo.js
```

## Next Steps

1. **Implement Authentication Flow**
   - Complete profile creation for graduates and companies
   - Add password reset functionality

2. **Implement Core Features**
   - Graduate profile management
   - Job posting and management
   - AI assessment submission
   - Match generation and review

3. **Enhance AI Service**
   - Improve feedback generation with structured JSON parsing
   - Add caching for embeddings
   - Optimize matching algorithm

4. **Admin Dashboard**
   - User management
   - AI activity monitoring
   - Analytics and reporting

5. **Testing**
   - Unit tests for backend
   - Integration tests for AI service
   - E2E tests for frontend

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Graduate
- `GET /api/graduates/profile` - Get profile
- `POST /api/graduates/profile` - Create/update profile
- `POST /api/graduates/assessment` - Submit assessment
- `GET /api/graduates/matches` - Get matches

### Company
- `GET /api/companies/profile` - Get profile
- `POST /api/companies/profile` - Create/update profile
- `POST /api/companies/jobs` - Create job
- `GET /api/companies/jobs` - List jobs
- `GET /api/companies/jobs/:jobId/matches` - Get job matches
- `PUT /api/companies/jobs/:jobId/matches/:matchId` - Update match status

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/jobs` - List all jobs
- `GET /api/admin/matches` - List all matches
- `GET /api/admin/ai-stats` - AI statistics

## AI Service Endpoints

- `POST /embed` - Generate embedding
- `POST /match` - Compute matches
- `POST /feedback` - Generate feedback

