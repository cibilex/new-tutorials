# CI - CD

**CI**: Continuous Integration. To ensure a contribution doesn’t break the project, CI automatically runs build, test, lint, and other checks on each commit/PR.
**CD**: After CI passes, we produce a production-ready project.

- CD has two modes:
  **Continuous Delivery:** requires a manual approval before deploying to production.
  **Continuous Deployment**: deploys to production automatically when the pipeline passes (no manual approval).
- **Jenkins** and **GitHub Actions** are tools that implement CI/CD pipelines to automate this process.
