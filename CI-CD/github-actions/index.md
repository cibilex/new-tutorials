- https://docs.github.com/en/actions/how-tos/monitor-workflows/add-a-status-badge
- `--legacy-peer-deps` npm option

# Github Actions

- we can use pre-defined workflow templates by clicking [here](https://docs.github.com/en/actions/how-tos/write-workflows/use-workflow-templates).

## Core Concepts

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
      - main
```

With this declaration, workflow will be triggered on every **push** on all branches except main branch.

**Note:** `branches` and `branches-ignore` cannot be used in the same workflow. Use `!` flag to exclude specific patterns:

```yaml
on:
  push:
    branches:
      - main
      - **`feature/*`**
      - "!**`feature/*-alpha`**"
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

## [Variables](https://docs.github.com/en/actions/reference/workflows-and-actions/variables):

- Variables are reusable definitions that can be used within the declared scope. For example a variable can be `job` level or `workflow` level.Variables are always strings.Github comes with some of useful variables.

```yml
env:
  APP_LINK: "http://localhost:3000"

jobs:
  job1:
    name: job1
    runs-on: ubuntu-latest
    env:
      APP_NAME: "Cibilex"
    steps:
      - name: write-info
        run: echo "$APP_NAME is running at $APP_LINK" # Cibilex is running at http://localhost:3000
      - name: write-job_id
        run: echo "This job is $GITHUB_JOB" # This job is job1
```

- We can make an environment variable available to any subsequent steps in a workflow job by defining or updating the environment variable and writing this to the GITHUB_ENV
  - `echo "{environment_variable_name}={value}" >> "$GITHUB_ENV"`

```yml
jobs:
  job1:
    name: job1
    runs-on: ubuntu-latest
    steps:
      - name: pass custom env
        run: echo "MY_ENV_VAR=Hi from the first step" >> $GITHUB_ENV
      - name: echo env
        run: 'echo "My custom env is : $MY_ENV_VAR"' # My custom env is : Hi from the first step
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

## [Secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)

- Secrets are encrypted key–value pairs containing sensitive data (like API keys or tokens). They are stored securely in GitHub and injected into workflows at runtime.
- Why map to env vars – Mapping secrets to environment variables can make commands simpler and avoid repeatedly typing `${{ secrets.NAME }}`.
- Secrets may contain characters that can break shell commands. Wrap them in quotes when referencing: `echo "$SUPER_SECRET"`
- There are three access levels for secrets:
  1. **Organization level**: Created at the organization level and selectively granted to repositories. Useful for shared credentials across multiple repos.
  2. **Repository level**: Defined in a single repository. Recommended for values not reused elsewhere.
  3. **Environment level**: Defined per environment (e.g., dev, staging, prod). Useful when secrets differ between environments.
- On the GitHub Free plan, organization-level secrets and variables are not accessible to private repositories.
- Secrets are available via the secrets context such as `${{ secrets.API_KEY }}`
- When printed, secrets appear as `***` in logs.
- Secrets cannot be directly referenced in `if`: conditionals. Instead, consider setting secrets as job-level environment variables, then referencing the environment variables to conditionally run steps in the job

```yml
with: # Set the secret as an input
  super_secret: ${{ secrets.SuperSecret }}
env: # Or as an environment variable
  super_secret: ${{ secrets.SuperSecret }}
```

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
3.
