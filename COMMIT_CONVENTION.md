# Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

## Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies (example scopes: npm, docker)
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

## Scope (Optional)

The scope should be the name of the package affected (e.g., `backend`, `frontend`, `ai-service`).

## Examples

### Good commit messages:

```
feat(backend): add JWT authentication middleware
fix(frontend): resolve login form validation issue
docs: update API documentation
refactor(ai-service): optimize embedding generation
test(backend): add unit tests for auth controller
chore: update dependencies
```

### Bad commit messages:

```
fix: bug
update code
WIP
fixes
```

## Rules

- Use the present tense ("add feature" not "added feature")
- Use the imperative mood ("move cursor to..." not "moves cursor to...")
- Don't capitalize the first letter
- No period (.) at the end
- Limit the subject line to 50 characters
- Reference issues and pull requests liberally after the first line

## Breaking Changes

If your commit introduces a breaking change, add `!` after the type/scope, or include `BREAKING CHANGE:` in the footer:

```
feat(backend)!: change authentication API

BREAKING CHANGE: JWT token format has changed
```

