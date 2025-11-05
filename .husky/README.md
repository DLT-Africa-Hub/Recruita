# Husky Git Hooks

This directory contains git hooks managed by [Husky](https://typicode.github.io/husky/).

## Hooks

- **pre-commit**: Runs before each commit
  - Executes `lint-staged` to run linting and formatting on staged files
  - Prevents commits if linting fails

- **commit-msg**: Validates commit messages
  - Uses Commitlint to ensure commit messages follow Conventional Commits format
  - Prevents commits with invalid message formats

## Manual Execution

You can manually test hooks:

```bash
# Test pre-commit hook
.husky/pre-commit

# Test commit-msg hook
.husky/commit-msg <commit-message-file>
```

## Disabling Hooks (Temporarily)

To skip hooks for a single commit:

```bash
git commit --no-verify -m "message"
```

⚠️ **Warning**: Only skip hooks in emergency situations. Invalid commits can break CI/CD pipelines.

