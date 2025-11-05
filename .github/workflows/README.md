# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## Workflows

### 1. CI (`ci.yml`)
**Triggers:** Push and Pull Requests to `main`/`develop` branches

**Jobs:**
- ✅ **Commitlint**: Validates commit messages on PRs
- ✅ **Backend**: Lint, format check, type check, and build
- ✅ **Frontend**: Lint, format check, type check, and build
- ✅ **AI Service**: Black formatting check, Flake8 linting, tests
- ✅ **Docker Build**: Tests Docker image builds for all services
- ✅ **Security Audit**: Runs npm audit for Node.js services

### 2. CD (`cd.yml`)
**Triggers:** Push to `main`, version tags (`v*`), manual dispatch

**Jobs:**
- 🚀 **Build and Push**: Builds and pushes Docker images to GitHub Container Registry
- 🚀 **Deploy Staging**: Deploys to staging environment on `main` branch
- 🚀 **Deploy Production**: Deploys to production on version tags

**Required Secrets:**
- `GITHUB_TOKEN` (automatically provided)

**Note:** Update deployment steps in `deploy-staging` and `deploy-production` jobs with your actual deployment commands.

### 3. Docker Compose Integration Test (`docker-compose-test.yml`)
**Triggers:** Pull Requests, manual dispatch

**Jobs:**
- 🐳 **Test Docker Compose Setup**: Starts all services with Docker Compose and verifies health endpoints

### 4. Dependency Update Check (`dependency-update.yml`)
**Triggers:** Weekly schedule (Monday 9 AM UTC), manual dispatch

**Jobs:**
- 📦 **Check Dependencies**: Checks for outdated npm and pip packages
- Sends notifications about available updates

### 5. CodeQL Analysis (`codeql-analysis.yml`)
**Triggers:** Push, Pull Requests, daily schedule

**Jobs:**
- 🔒 **Security Analysis**: Runs CodeQL security analysis for JavaScript and Python code

### 6. PR Labeler (`pr-labeler.yml`)
**Triggers:** Pull Request opened/synchronized

**Jobs:**
- 🏷️ **Auto-label PRs**: Automatically labels PRs based on changed files (backend, frontend, ai-service, etc.)

## Required GitHub Secrets

For full functionality, configure these secrets in GitHub repository settings:

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- `OPENAI_API_KEY` - For AI service tests (optional)
- `VITE_API_URL` - For frontend builds (optional, defaults to localhost)

## Deployment Secrets (if using CD workflow)

- `KUBECONFIG` - For Kubernetes deployments
- `SSH_PRIVATE_KEY` - For SSH-based deployments
- `DOCKER_REGISTRY_TOKEN` - For external Docker registries

## Status Badges

Add these badges to your README.md:

```markdown
![CI](https://github.com/OWNER/REPO/workflows/CI/badge.svg)
![CD](https://github.com/OWNER/REPO/workflows/CD/badge.svg)
![CodeQL](https://github.com/OWNER/REPO/workflows/CodeQL%20Analysis/badge.svg)
```

## Customization

### Adding Tests

To add automated tests:

1. **Backend Tests**: Add test scripts to `backend/package.json` and run them in CI
2. **Frontend Tests**: Add test scripts to `frontend/package.json` and run them in CI
3. **AI Service Tests**: Create `ai-service/tests/` directory with pytest tests

### Deployment

Update the `deploy-staging` and `deploy-production` jobs in `cd.yml` with your deployment commands:

- Kubernetes: Use `kubectl` commands
- Docker Swarm: Use `docker stack deploy`
- AWS/GCP/Azure: Use respective CLI tools
- SSH-based: Use `ssh` and `docker-compose` commands

### Environment-Specific Builds

Modify the CD workflow to use different Dockerfiles or build args based on the environment:

```yaml
build-args: |
  NODE_ENV=${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
```

