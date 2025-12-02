- https://docs.github.com/en/actions/how-tos/monitor-workflows/add-a-status-badge
- `--legacy-peer-deps` npm option

# Github Actions

- we can use pre-defined workflow templates by clicking [here](https://docs.github.com/en/actions/how-tos/write-workflows/use-workflow-templates).

## Core Concepts

### Workflows

- **Workflows** are automated processes that include one or more jobs
- They're defined by YAML files within `./github/workflows` directory
- Can be triggered manually, on schedule, or by events (push, pull request, etc.)
- `name`: represents the workflow name, if not specified, GitHub uses the file path as the workflow name

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

### Jobs

- **Jobs** are a set of steps that run on the same runner
- Jobs run in parallel by default (unless you specify dependencies)
- Each job runs in a fresh instance of the virtual environment
- Can have conditions, dependencies, and different runner types

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Build application
        run: npm run build

  test:
    runs-on: ubuntu-latest
    needs: build # This job waits for build to complete
    steps:
      - name: Run tests
        run: npm test
```

### Steps

- **Steps** are individual tasks that can run commands or actions
- Steps run sequentially within a job
- Can use pre-built actions or run shell commands
- Each step has access to the workspace and can share data with other steps

```yaml
steps:
  - name: Checkout repository
    uses: actions/checkout@v4

  - name: Install dependencies
    run: npm install

  - name: Run linter
    run: npm run lint

  - name: Build project
    run: npm run build
```

### Runners

- **Runners** are servers that execute your workflows
- GitHub provides hosted runners (Ubuntu, Windows, macOS)
- You can also use self-hosted runners on your own infrastructure
- Runners provide the execution environment for jobs
- Each runner type has different capabilities and pre-installed software

#### GitHub-Hosted Runners

```yaml
runs-on: ubuntu-latest    # Latest Ubuntu version
runs-on: windows-latest   # Latest Windows version
runs-on: macos-latest     # Latest macOS version
```

#### Self-Hosted Runners

```yaml
runs-on: self-hosted      # Your own runner
runs-on: [self-hosted, linux, x64]  # With labels
```

### Actions

- **Actions** are reusable units of code that perform specific tasks.They are stored in repositories and versioned with Git.
- Examples: `actions/checkout@v4`, `actions/setup-node@v4`

```yaml
- name: Checkout code
  uses: actions/checkout@v4

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: "18"
```

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        GITHUB ACTIONS FLOW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Event Trigger (push/PR)                                        │
│         ↓                                                       │
│  ┌─────────────┐                                               │
│  │  WORKFLOW   │ ← YAML file in .github/workflows/             │
│  └─────────────┘                                               │
│         ↓                                                       │
│  ┌─────────────┐                                               │
│  │    RUN      │ ← Individual execution                        │
│  └─────────────┘                                               │
│         ↓                                                       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │    JOB 1    │    │    JOB 2    │    │    JOB 3    │         │
│  │ (Parallel)  │    │ (Parallel)  │    │ (Parallel)  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         ↓                   ↓                   ↓              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   RUNNER    │    │   RUNNER    │    │   RUNNER    │         │
│  │ (Ubuntu)    │    │ (Windows)   │    │ (macOS)     │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         ↓                   ↓                   ↓              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   STEPS     │    │   STEPS     │    │   STEPS     │         │
│  │ (Sequential)│    │ (Sequential)│    │ (Sequential)│         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         ↓                   ↓                   ↓              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   ACTIONS   │    │   ACTIONS   │    │   ACTIONS   │         │
│  │ & Commands  │    │ & Commands  │    │ & Commands  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

```

## [Schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onschedule)

- Use `cron` syntax to trigger workflows at specific times
- Schedule workflows run only on default branch
- There can be latency in the first execution (up to 5 minutes)
- Timezone is UTC
- Minimum interval is 5 minutes

```yaml
on:
  schedule:
    - cron: "0 2 * * *" # Daily at 2 AM UTC
    - cron: "*/30 * * * *" # Every 30 minutes
    - cron: "0 0 * * 0" # Weekly on Sunday at midnight
```

## Events

- Events trigger workflows to run. If multiple triggers are defined and they trigger the workflow at the same time, workflow will run multiple times.
- Basic Declaration:

```yaml
on: [push, pull_request]
```

With this declaration, workflow will be triggered on every **push** or **pull_request** on every branch.

```yaml
on:
  push:
    branches:
      - main
      - feature/*
```

With this declaration, workflow will be triggered on every **push** on main branch and branches whose name starts with **`feature/*`**

```yaml
on:
  push:
    branches-ignore:
      - mainc
```

With this declaration, workflow will be triggered on every **push** on all branches except main branch.

**Note:** `branches` and `branches-ignore` cannot be used in the same workflow. Use `!` flag to exclude specific patterns:

```yaml
on:
  push:
    branches:
      - main
      - feature/*
      - "!feature/*-alpha"
```

This triggers on main and **`feature/*`** branches, but excludes branches ending with **`-alpha`**.

## Paths and Paths-Ignore

- **`paths`**: Workflow runs if any changed file matches the pattern
- **`paths-ignore`**: Workflow runs if any changed file doesn't match the pattern
- **`paths`** and **`paths-ignore`** cannot be used together in the same workflow
- Use `!` flag to exclude specific paths
- **Important**: Paths are relative to repository root

```yaml
on:
  push:
    paths:
      - "src/**"
```

This triggers workflow when any file in `src/` folder or subdirectories is modified.

**Glob Patterns:**

- `*` matches single directory level
- `**` matches all subdirectories
- `src/*` = first level children of src/
- `src/**` = all children and subdirectories

**Combined Filters:**

```yaml
on:
  push:
    paths:
      - "src/**"
    branches:
      - main
      - `feature/*`
```

This triggers on **push**es to main/**`feature/*`** branches only when files in `src/` are modified.

## [Manual Workflow Triggers](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onworkflow_dispatch)

- Workflows cannot be triggered manually by default
- Use **`workflow_dispatch`** to enable manual execution via GitHub UI, CLI, or API
- Allows up to 10 input parameters
- We can access inputs by `{{inputs.inputName}}`

**Input Types:**

- `string` - Text input
- `choice` - Dropdown selection
- `boolean` - True/false checkbox
- `number` - Numeric input

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Deployment environment"
        required: true
        type: choice
        options:
          - staging
          - production
      name:
        description: "Write your name"
        required: true
        type: string
jobs:
  say-hi:
    runs-on: ubuntu-latest
    steps:
      - name: write title
        run: echo "Hello, ${{ inputs.name  }}"
      - name: write environment
        run: echo "Deploying to ${{ inputs.environment  }}"
```

**Usage:**

- GitHub UI: Actions tab → Select workflow → "Run workflow" button
- If we declare this file, then our `actions > Manual Workflow > Run workflow` looks this image: ![drawing](https://i.ibb.co/JwkB2Nr7/Screenshot-2025-08-11-at-17-15-43.png)

## [Dependent Jobs](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-jobs)

- **Default**: Jobs run in parallel
- **`needs`**: Creates dependencies between jobs
- **Failure behavior**: If dependency fails, dependent jobs are skipped.Add `if: always()` to run jobs even after failures

```yml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Linting..."

  test:
    runs-on: ubuntu-latest
    needs: build # Waits for lint to succeed
    steps:
      - run: echo "Testing..."

  deploy:
    runs-on: ubuntu-latest
    needs: [lint, test] # Waits for both to succeed
    steps:
      - run: echo "Deploying..."
```

```yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: exit 1 # This will fail

  cleanup:
    runs-on: ubuntu-latest
    needs: build
    if: ${{always()}} # Runs even if build fails
    steps:
      - run: echo "Cleaning up..."
```

## [Contexts](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts)

- Context are read-only objects that includes information about github, job, workflow etc.... .They are usually used with expressions.

```yml
jobs:
  contexts:
    runs-on: ubuntu-latest
    steps:
      - name: write actor info
        run: 'echo "Actor: ${{ github.actor }}, actor id: ${{ github.actor_id }}"'
      - name: wrte workflow info
        run: 'echo "Workflow: ${{ github.workflow }}, workflow id: ${{ github.workflow_id }}"'
```

- `#*/` is **Bash parameter expansion** that extracts the substring **after the first `/`** in a string.  
  Example: `"owner/repo" → "repo"` using `${VAR#*/}`.

- By default, GitHub expressions `${{ ... }}` are evaluated **before the step runs**.  
  You **cannot directly use `#*/`** in `${{ github.repository#*/ }}`.  
  To use Bash operators like `#*/`, set the step to run in **Bash** using `run: |`.

- GitHub automatically passes **context and environment variables** to Bash:
  - `github.repository` → `$GITHUB_REPOSITORY` (e.g., `owner/repo`)
  - `github.repository_owner` → `$GITHUB_REPOSITORY_OWNER` (e.g., `owner`)

---

- Example Workflow Steps

```yaml
steps:
  - name: Log full repository (GitHub expression)
    run: echo ${{ github.repository }} # Logs: owner/repo

  - name: Log repository name only (Bash)
    run: |
      REPO_NAME="${GITHUB_REPOSITORY#*/}"         # Extract repo name
      echo "Repo name in this step: $REPO_NAME"  # Logs repo name
      echo "REPO_NAME=$REPO_NAME" >> $GITHUB_ENV # Makes it available to later steps

  - name: Log repository owner (GitHub expression)
    run: echo ${{ github.repository_owner }} # Logs: owner

  - name: Log repository owner (Bash)
    run: |
      echo "$GITHUB_REPOSITORY_OWNER"            # Logs: owner
```

### Variables

- Reusable **string values** in workflows.
- Scope depends on `env:` placement: **workflow > job > step**.

#### Static Variables

- Declared directly in the workflow YAML.
- Access:

  - Shell: `$NAME`
  - Expression: `${{ env.NAME }}`

```yaml
env:
  GLOBAL: "global"

jobs:
  build:
    env:
      JOB: "job"
    steps:
      - name: Step
        env:
          STEP: "step"
        run: echo $STEP
```

#### Configuration Variables

- Managed in GitHub UI, accessed via `${{ vars.NAME }}`
- Levels:

  1. Repository
  2. Organization
  3. Environment

```yaml
jobs:
  deploy:
    environment: prod
```

- Recommended: use dynamic environments via branch name:

```yaml
environment: ${{ github.ref_name }}
```

#### Persisting Variables Across Steps

```bash
echo "VAR=value" >> "$GITHUB_ENV"
```

---

### Secrets

- Encrypted and masked: `${{ secrets.NAME }}`
- When printed in logs → `***`
- Cannot be used directly in `if:` conditions; use job-level env workaround:

```yaml
jobs:
  example:
    env:
      MY_SECRET: ${{ secrets.MY_SECRET }}
    steps:
      - name: Conditional
        if: env.MY_SECRET == 'value'
        run: echo "Secret-based step"
```

- Available at same levels as configuration variables: repository, organization, environment.

## Useful workflow actions

1. `[actions/checkout@v4](https://github.com/marketplace/actions/checkout)`: On the VM there are nothing to run.If we need to run test files or do anyhing with our github repository.We need this package to clone our repository into workflow which is `$GITHUB_WORKSPACE`.
   - `fetch-depth`: this library uses `git fetch --depth=<number>` .This option just passes the `--depth` parameter and decide how many commits should be fetched.By default it's `1`.To get all history we can use `fetch-depth:0`
   - ```yml
     jobs:
       job1:
         runs-on: ubuntu-latest
         steps:
           - name: Checkout code
             uses: actions/checkout@v5
             with:
               fetch-depth: 0
     ```
2. `[actions/setup-node@v4](https://github.com/actions/setup-node)`: is used to install specified node version into our workflow runner.
   - `node-version`: is used to specify the node version. `# Examples: 12.x, 10.15.1, >=10.15.0, latest, node`
   - ```yml
     jobs:
       job1:
         runs-on: ubuntu-latest
         steps:
           - name: Set up Node.js
             uses: actions/setup-node@v2
             with:
               node-version: "20.12.2"
     ```

## Example for `pull_requests`:

```yml
name: Check whether the pr is ready to merge
on:
  pull_request:
jobs:
  check-pr:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "23"

      - name: Install dependencies
        run: npm i --legacy-peer-deps

      - name: Run lint
        run: npm run lint

      - name: Run tests
        run: npm run test

      - name: Build application
        run: npm run build
```

### OIDC

OIDC (OpenID Connect) is an identity federation protocol that allows external systems (like GitHub Actions, Kubernetes, or CI/CD pipelines) to authenticate to cloud providers without storing long-lived credentials.

Instead of using permanent IAM user access keys, OIDC lets your external system prove its identity, and the cloud provider (e.g., AWS) responds by issuing short-lived, automatically expiring credentials through STS.

This removes the risk of leaked access keys and enables secure, temporary access for operations in AWS, Azure, GCP, and other providers.

- **What is OIDC?**

  - OIDC (OpenID Connect) provides \*\*short-lived, temporary authentication
  - tokens\*\* instead of permanent credentials.\
  - With GitHub Actions → AWS:

- **GitHub issues an OIDC JWT**
- **AWS validates the token**
- **AWS STS returns temporary credentials**
- Credentials expire automatically and cannot be reused\
  → More secure than storing IAM Access Keys.

OIDC is supported by major cloud providers (AWS, Azure, GCP).

---

## **How OIDC Works (High-Level Flow)**

1.  GitHub workflow requests a **JWT (OIDC token)**\
2.  GitHub sends this JWT to AWS STS with:
    - Repo name
    - Owner/organization
    - Branch
    - Workflow info
3.  AWS checks the token against the IAM Role **trust policy**\
4.  AWS issues **temporary credentials**\
5.  Workflow uses them\
6.  Credentials expire

---

## Step-by-Step Explanation

- **Step 1 — Verify Codebase Agility**

  - **Checkout repository**
    - Action: [`actions/checkout@v4`](https://github.com/actions/checkout)
    - Pulls your repository code to the GitHub runner.
  - **Setup Node.js**
    - Action: [`actions/setup-node@v4`](https://github.com/actions/setup-node)
    - Ensures Node.js is installed for building/testing.
  - **Lint**
    - Command: `npm run lint`
    - Checks for code style and formatting issues.
  - **Build**
    - Command: `npm run build`
    - Compiles the code for deployment.
  - **Test**
    - Command: `npm run test`
    - Runs unit/integration tests to verify correctness.

- **Step 2 — Set up AWS Authentication**

  - **Step 2a — [Add GitHub as an Identity Provider in AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws#adding-the-identity-provider-to-aws)**
    - IAM → Identity Providers → Add Provider
    - Provider Type: **OpenID Connect**
    - Provider URL: `https://token.actions.githubusercontent.com`
    - Audience: `sts.amazonaws.com`
    - This allows AWS to trust GitHub.
  - **Step 2b — Create an IAM Role for GitHub OIDC**
    - IAM → Roles → Create Role → Web identity
    - **Trusted entity type:** Web identity
    - **Identity provider:** The GitHub OIDC provider you added
    - **Audience:** `sts.amazonaws.com`
    - **GitHub Organization**: Organization name (or username for personal repos)
    - Optional restrictions:
      - GitHub Repository (`your-org/your-repo`)
      - Branch (`main`, `prod`, etc.)
  - **Step 2c — Configure GitHub Actions Workflow for OIDC Authentication**
    - [`aws-actions/configure-aws-credentials@v5`](https://github.com/aws-actions/configure-aws-credentials): Allows GitHub Actions to perform AWS CLI operations (ECR login, ECS deployment) without storing permanent AWS keys.Injects temporary AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN) into the workflow environment
      - Options:
        - `aws-region`: Region of your AWS resources (ECR/ECS).
        - `role-to-assume`: IAM Role ARN GitHub assumes.
        - `role-session-name`: Optional label for logs, defaults to `GitHubActions`.

- **Step 3 — Build and Push Docker Image**

  - **Log in to ECR**
    - [`aws-actions/amazon-ecr-login@v2`](https://github.com/aws-actions/amazon-ecr-login): Automatically logs GitHub into ECR using temporary AWS credentials
    - **Purpose:** Docker can now push/pull images to/from ECR without storing permanent credentials.
  - **Build Docker image**
    - Command: `docker build -t <versioned> -t <latest> .`
    - Multi-tagging allows version control + “latest” in a single build.
  - **Push Docker image to ECR**
    - Command: `docker push $ECR_REPOSITORY --all-tags`
    - Sends both tags to AWS ECR repository.

- **Step 4 — Update ECS Service**
  - **Fetch current task definition**
    - Command: `aws ecs describe-services ...` → saves `task-definition.json`
    - **Purpose:** Avoid committing sensitive environment variables.
  - **Render updated task definition**
    - [`aws-actions/amazon-ecs-render-task-definition@v1`](https://github.com/aws-actions/amazon-ecs-render-task-definition)
    - Replaces container image in the task definition with the new Docker image.
  - **Deploy updated task definition**
    - [`aws-actions/amazon-ecs-deploy-task-definition@v2`](https://github.com/aws-actions/amazon-ecs-deploy-task-definition)
    - ECS performs a **rolling update**, replacing old tasks gradually while keeping the service available.
    - `wait-for-service-stability: true` ensures workflow waits until the service is stable.

```yml
####################################################################################
# GitHub Actions Workflow: Build Docker + Push to ECR + Deploy to ECS
####################################################################################

name: Test aws-ecr-credentials

on:
  push:
    branches:
      - prod
      - dev

permissions:
  id-token: write # Required for OIDC authentication (GitHub → AWS)
  contents: read # Required to checkout repository code

jobs:
  test-aws:
    environment: ${{ github.ref_name }} # environment name is branch name. so we should create github environment by this info.
    runs-on: ubuntu-latest

    steps:
      # ----------------------------------------
      # Step 1 — Verify Codebase Agility
      # ----------------------------------------
      - name: Checkout code
        uses: actions/checkout@v4 # Fetch repository code

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: "23" # Ensure correct Node.js version

      - name: Install dependencies
        run: npm install --legacy-peer-deps # Install project dependencies

      - name: Build project
        run: npm run build # Compile TypeScript / bundle assets

      - name: Run tests
        run: npm run test # Validate project functionality

      # ----------------------------------------
      # Step 2 — Set up AWS Authentication
      # ----------------------------------------
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v5
        with:
          aws-region: ${{ vars.AWS_REGION }} # AWS region (matches your ECR)
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }} # IAM Role ARN for OIDC
          role-session-name: ${{ vars.AWS_SESSION_NAME }} # Optional session label

      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v2 # Docker authentication to ECR

      # ----------------------------------------
      # Step 3 — Build and Push Docker Image
      # ----------------------------------------
      - name: Prepare dynamic environment variables
        env:
          ECR_REPOSITORY: "${{ secrets.ECR_REPOSITORY }}"
        run: |
          REPO_NAME=${GITHUB_REPOSITORY#*/}           # Extract repository name
          COMMIT_HASH=$(git rev-parse --short $GITHUB_SHA) # Short commit hash

          DOCKER_LATEST_VERSION_ID=${ECR_REPOSITORY}:${COMMIT_HASH} # Commit tag
          DOCKER_LATEST_VERSION_TAG=${ECR_REPOSITORY}:latest         # Latest tag

          echo "REPO_NAME=$REPO_NAME" >> $GITHUB_ENV
          echo "COMMIT_HASH=$COMMIT_HASH" >> $GITHUB_ENV
          echo "DOCKER_LATEST_VERSION_ID=$DOCKER_LATEST_VERSION_ID" >> $GITHUB_ENV
          echo "DOCKER_LATEST_VERSION_TAG=$DOCKER_LATEST_VERSION_TAG" >> $GITHUB_ENV

      - name: Log prepared environments
        run: |
          echo "REPO_NAME = $REPO_NAME"
          echo "COMMIT_HASH = $COMMIT_HASH"
          echo "DOCKER_LATEST_VERSION_ID = $DOCKER_LATEST_VERSION_ID"
          echo "DOCKER_LATEST_VERSION_TAG = $DOCKER_LATEST_VERSION_TAG"

      - name: Build Docker image
        run: |
          docker build \
            -t $DOCKER_LATEST_VERSION_ID \
            -t $DOCKER_LATEST_VERSION_TAG . # Multi-tag build

      - name: List Docker images (side check)
        run: docker images | grep $ECR_REPOSITORY

      - name: Push Docker image to ECR
        env:
          ECR_REPOSITORY: "${{ secrets.ECR_REPOSITORY }}"
        run: docker push $ECR_REPOSITORY --all-tags

      # ----------------------------------------
      # Step 4 — Update ECS Service
      # ----------------------------------------
      - name: Fetch task definition
        id: fetch-task-def
        env:
          ECS_CLUSTER: "${{ secrets.ECS_CLUSTER }}"
          ECS_SERVICE: "${{ secrets.ECS_SERVICE }}"
        run: |
          if [ -z "$ECS_CLUSTER" ] || [ -z "$ECS_SERVICE" ]; then
            echo "Warning: ECS_CLUSTER or ECS_SERVICE not set. Skipping ECS deployment."
            exit 1
          fi

          echo "Fetching task definition for service: $ECS_SERVICE"
          TASK_DEF_ARN=$(aws ecs describe-services \
            --cluster $ECS_CLUSTER \
            --services $ECS_SERVICE \
            --region ${{ vars.AWS_REGION }} \
            --query 'services[0].taskDefinition' \
            --output text)

          if [ "$TASK_DEF_ARN" == "None" ] || [ -z "$TASK_DEF_ARN" ]; then
            echo "Error: Could not fetch task definition ARN"
            exit 1
          fi

          echo "Task Definition ARN: $TASK_DEF_ARN"
          echo "should_deploy=true" >> $GITHUB_OUTPUT

          aws ecs describe-task-definition \
            --task-definition $TASK_DEF_ARN \
            --region ${{ vars.AWS_REGION }} \
            --query 'taskDefinition' > task-definition.json

      - name: Render task definition
        id: task-def
        if: steps.fetch-task-def.outputs.should_deploy == 'true'
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: task-definition.json
          container-name: ${{ secrets.CONTAINER_NAME }}
          image: ${{ env.DOCKER_LATEST_VERSION_ID }}

      - name: Deploy task definition
        if: steps.fetch-task-def.outputs.should_deploy == 'true'
        uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: ${{ secrets.ECS_SERVICE }}
          cluster: ${{ secrets.ECS_CLUSTER }}
          wait-for-service-stability: true
```

#### Secrets and Variables: we should set this configurations in github.

- **Secrets**
  | Secret Name | Description |
  | ---------------- | -------------------------------------------------------------------------- |
  | `AWS_ROLE_ARN` | AWS IAM Role ARN for OIDC authentication. |
  | `ECR_REPOSITORY` | Full ECR URI (e.g., `123123123.dkr.ecr.eu-north-1.amazonaws.com/cibilex`). |
  | `ECS_CLUSTER` | ECS cluster name (e.g., `my-cluster`). |
  | `ECS_SERVICE` | ECS service name (e.g., `my-service`). |
  | `CONTAINER_NAME` | Container name in task definition (e.g., `my-container`). |
- **Variables**
  | Variable Name | Type | Description |
  | --------------------------- | ----------------------- | ------------------------------------------------- |
  | `AWS_REGION` | Repository/Env variable | AWS region for ECR/ECS (e.g., `eu-north-1`). |
  | `AWS_SESSION_NAME` | Repository/Env variable | Optional session name (default: `GitHubActions`). |
  | `REPO_NAME` | Dynamic env variable | Extracted repo name from `$GITHUB_REPOSITORY`. |
  | `COMMIT_HASH` | Dynamic env variable | Short SHA of current commit. |
  | `DOCKER_LATEST_VERSION_ID` | Dynamic env variable | Docker image tag with commit hash. |
  | `DOCKER_LATEST_VERSION_TAG` | Dynamic env variable | Docker image tag `latest`. |
