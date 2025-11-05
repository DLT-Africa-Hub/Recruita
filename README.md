# Talent Hub - AI-Driven Job Matching Platform

A full-stack AI-driven job matching platform that automatically connects graduates with companies based on skill assessments and job requirements.

## 🏗️ Architecture

- **Backend**: Node.js + Express (TypeScript)
- **Database**: MongoDB (Mongoose ODM)
- **Frontend**: React (Vite)
- **AI Microservice**: Python (FastAPI)
- **AI API**: OpenAI API (text-embedding-3-large for matching, GPT-4 for evaluation)

## 📦 Project Structure

```
talent-hub/
├── backend/          # Node.js + Express backend
├── ai-service/       # Python FastAPI AI microservice
├── frontend/         # React frontend
└── infrastructure/   # Docker and deployment configs
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.10+ (for local AI service development)

### Using Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Local Development

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### AI Service

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔑 Environment Variables

Copy `.env.example` files in each directory and fill in your values:

- OpenAI API key
- MongoDB connection string
- JWT secret

## 🛠️ Development Tools

### Husky & Commitlint

This project uses [Husky](https://typicode.github.io/husky/) for git hooks and [Commitlint](https://commitlint.js.org/) for commit message validation.

**Initial Setup:**

```bash
# Install root dependencies (Husky, Commitlint)
npm install

# Initialize Husky (runs automatically via prepare script)
npm run prepare
```

**Commit Message Format:**
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat(scope): description` - New feature
- `fix(scope): description` - Bug fix
- `docs: description` - Documentation
- `refactor(scope): description` - Code refactoring
- `test(scope): description` - Tests
- `chore: description` - Maintenance tasks

See [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md) for detailed guidelines.

**Pre-commit Hooks:**

- Automatically runs linting and formatting on staged files
- Validates commit messages before allowing commits

### GitHub Actions CI/CD

This project includes comprehensive GitHub Actions workflows for continuous integration and deployment.

**Workflows:**

- ✅ **CI** - Runs on every push/PR: linting, type checking, building, Docker builds, security audits
- 🚀 **CD** - Deploys to staging/production on main branch and version tags
- 🐳 **Docker Compose Test** - Integration tests with full stack
- 📦 **Dependency Update** - Weekly checks for outdated packages
- 🔒 **CodeQL** - Automated security analysis
- 🏷️ **PR Labeler** - Auto-labels PRs based on changed files

See [`.github/workflows/README.md`](.github/workflows/README.md) for detailed documentation.

**Status Badges:**

```markdown
![CI](https://github.com/DLT-Africa-Hub/talent-hub/workflows/CI/badge.svg)
![CD](https://github.com/DLT-Africa-Hub/talent-hub/workflows/CD/badge.svg)
```

## 📝 Next Steps

After setup, implement:

1. Authentication flow
2. Profile management
3. Job posting
4. AI matching logic
5. Admin dashboard

**📋 Full Implementation Roadmap:** See [ISSUE.md](./ISSUE.md) for a comprehensive list of all features and tasks that need to be implemented to complete the project.
