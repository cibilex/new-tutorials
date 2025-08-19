- bind vs mount in docker

## **Containers**:

- A container is an isolated, self-contained environment—like a mini virtual machine, but much lighter and faster.
- Containers share the host OS kernel but run independently, preventing conflicts such as port collisions, library clashes, or memory contention.
- Multiple containers can run on the same host, even if they require different versions of Node, Redis, or databases, without interfering with each other.
- Containers make it possible to create an infrastructure that behaves consistently across environments, reducing the risk of unexpected crashes or errors.

### **Container Commands**:

- `docker container run [OPTIONS] IMAGE [COMMAND]`

  - **`-p, --publish HOST_PORT:CONTAINER_PORT`**: Maps a host port to a container port, allowing access to services running inside the container.

    - `-p 3000:3000` → access container’s port 3000 via host’s port 3000.
    - `-p 6060:3000` > access container's port 3000 via host's port 6060.

  - **`-d, --detach`** :Runs the container in the background.Without `-d`, the container runs attached: logs appear in the terminal and it stops when we exit. We can still view its output using `docker logs NAME`.

  - **`-e, --env`** Sets environment variables inside the container.  
    -`-e NODE_ENV=production`

  - **`-v, --volume HOST_PATH:CONTAINER_PATH`**: When we use a volume, a new directory is created within Docker's storage directory on the host machine, and Docker manages that directory's contents.

  - **`--name`**: Assigns a custom name to the container.If not specified, Docker generates a unique name automatically. .Containers can also be referenced by their ID.
    **Example:** `--name auth-service`
  - `docker run -d --name redis-server redis:7`: Starts a Redis 7 container in the background.
  - `docker run -d -p 8080:3000 --name service-x node:14`
  - `docker run -d -p 5000:5000 -v ~/app:/app -e NODE_ENV=development --name full-container node:14`:
    - Detached mode (-d)
    - Port mapping (-p 5000:5000)
    - Volume mount (-v ~/app:/app)
    - Environment variable (-e NODE_ENV=development)
    - Custom container name (--name full-container)

- `docker start CONTAINER`: Starts a container that was previously created or stopped
- `docker stop CONTAINER`: Sends a **SIGTERM** signal to the main process inside the container, giving it time to **clean up and exit**.If the process doesn’t stop within a timeout (default 10 seconds), Docker sends **SIGKILL** to forcefully stop it.
- `docker kill CONTAINER`: Sends a SIGKILL signal directly, forcing the main process to terminate without cleanup.
- `docker rm CONTAINER`: Removes a container from the system.
- `docker ls`: New command to list Docker containers.By default, it shows **only running containers**.
  - `-a` → shows **all containers**, including stopped ones.
  - `-q` → shows **only container IDs** (useful for scripting).
- `docker container exec [OPTIONS] CONTAINER COMMAND`: Execute a command in a running container
  - `docker exec -d CONTAINER touch hi_world` : Creates a new file called `hi_world` at the root of the container.`-d` → runs the command in the background
  - `docker exec -it CONTAINER bash`: Starts a fresh interactive bash terminal inside the container.
- `docker stats [CONTAINER]` → Shows real-time CPU, memory, and network usage for containers.

# Quick Roadmap for Exploring a Docker Image

1. **Check Docker Hub**Read description, tags, and usage examples

   - Example: [Redis Docker Hub](https://hub.docker.com/_/redis)

2. **Check Environment Variables & Config**: Look for supported env vars, flags, and volumes

   - Example: [Redis env vars](https://docs.retool.com/self-hosted/reference/environment-variables/redis)

3. **Check CLI & Auth Options**: Learn how to interact with the service and authenticate.

   - Example: [Redis AUTH command](https://redis.io/docs/latest/commands/auth/)

4. **Look for Best Practices**

## **Images**

- A Docker image is a blueprint for containers—think of it as a recipe to create a container.
- It contains everything the project needs to run, including runtime environments (Node, Python, etc.), libraries, and configuration files.
- Images ensure that containers behave consistently across different environments, so our project infrastructure is always the same whether on development, testing, or production.

### **Image Commands**

- **`docker pull NAME[:TAG]`** – Downloads an image from a registry (Docker Hub or private).

  - `docker pull redis` (pulls latest Redis image), `docker pull redis:bookworm` (pulls Redis image tagged "bookworm").

- **`docker images`** – Lists all images on our local machine.

- **`docker rmi NAME[:TAG]`** – Removes an image from our local machine.

  - `docker rmi redis:bookworm`

- **`docker inspect NAME[:TAG]`** – Shows detailed information about an image, including layers, environment variables, default command, and metadata.
  - `docker inspect redis:bookworm`

## Dockerfile

- A Dockerfile is a text file that contains a set of instructions to build a Docker image.Each instruction creates a layer in the image.
- **#** is used to add comments that are ignored during the build.
- **FROM** is always the first instruction in a Dockerfile (except for optional ARG before it).
  | Image | Size | OS | Notes |
  | ---------------- | -------- | ------------ | ---------------------------------------------------- |
  | `node:20-alpine` | \~20 MB | Alpine Linux | Very small, minimal, secure, may need extra packages |
  | `node:20-slim` | \~100 MB | Debian Slim | Compatible with most modules, easier debugging |
  | `node:20` | \~400 MB | Full Debian | Largest, fully featured, rarely needed |
- Use Alpine if we want smallest image and security.
- Use Slim if we want compatibility and easier debugging.
- Avoid full images unless we really need the full OS environment.

- **WORKDIR CONTAINER_PATH**: Sets the working directory inside the container.WORKDIR is optional, but recommended to keep the container organized and avoid placing files in the root directory.All subsequent instructions that use relative paths (COPY, RUN, etc.) will be based on this directory.If the directory doesn’t exist, Docker will create it automatically. `WORKDIR app`
- **COPY HOST_PATH CONTAINER_PATH**: COPY is used to copy files or directories from our host machine into the container, usually relative to the working directory.
- **RUN COMMAND**: Executes commands during the image build, not at runtime `RUN npm i`
- **EXPOSE PORT** :Informs Docker which port our container will listen on.It does not publish the port to the host; it’s mostly documentation.
- **ENV <KEY>=<VALUE>**: Sets environment variables inside the container.These variables can be used by the app or other commands in the Dockerfile.ENV variables in a Dockerfile act as default values for the container.We can override them at runtime using the -e flag or an environment file.
  - ```dockerfile
    ENV NODE_ENV=development
    ENV PORT=3000
    RUN echo "The app is running in $NODE_ENV on port $PORT"
    ```
- **CMD COMMAND**:Defines the default command to run when the container starts.Only the last CMD in a Dockerfile is used
  | Feature | Exec Form | Shell Form | | |
  | ------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------- | ------------ |
  | **Syntax** | `CMD ["executable","param1","param2"]` | `CMD command param1 param2` | | |
  | **How it runs** | Directly, no shell | Through `/bin/sh -c` | | |
  | **Supports multiple commands** | ❌ Cannot use `&&`, \` | \`, or chain commands | ✅ Supports `&&`, \` | \`, chaining |
  | **Environment variable inline** | ❌ Cannot declare `VAR=value` inline; use `ENV` or `-e` | ✅ Can do `VAR=value command` | | |
  | **Signal handling** | ✅ Proper, safer for production | ❌ Less predictable, may not handle signals properly | | |
  | **Use case** | Recommended for single command apps, production | Use only if we need shell features like chaining or variable expansion | | |

### Building Dockerfile

- `docker build [OPTIONS] PATH`
- `docker build -t my-image .`: This reads the Dockerfile in the current directory and creates an image tagged my-image.
- By default, BuildKit hides the output of RUN commands in the logs for brevity.To see full output of commands like `RUN ls -a ` or `RUN echo "hi"` use `--progress=plain` flag.
- Each instruction in the Dockerfile creates a layer.Docker caches layers to speed up future builds.If a layer hasn’t changed, Docker reuses the cached version.To force all steps to run and ignore cached layers use `--no-cache` flag.

### Dockerignore

- We can use a `.dockerignore` file to exclude files or directories from the build context.Its format is the same as `.gitignore`

```dockerfile
# sets the base image
FROM node:current-alpine3.22
# sets the working directory for the container
WORKDIR /app
# copies the rest of the files to working directory
COPY . .
# list the files in the working directory
RUN ls -a
# echo "hi world"
RUN echo "hi world"
# install dependencies
RUN npm i --legacy-peer-deps
# set the environment variable for the node environment
ENV NODE_ENV=prod
# expose the port 3000 which is the port that the server will run on
EXPOSE 3000
# set the command to run when the container starts
CMD ["npm","run","start:prod"]

```

## [Multi-Stage Builds in Docker](https://docs.docker.com/build/building/multi-stage/)

A Docker multi-stage build uses multiple `FROM` stages in a Dockerfile to separate build and runtime environments.  
Only essential artifacts (e.g., compiled code) are copied to the final stage, creating a **smaller** and **more secure** image.

### Benefits

- **Smaller Images**: Excludes source code and dev dependencies, reducing size (e.g., ~100MB vs. 1GB).
- **Security**: Fewer files lower the attack surface.
- **Efficiency**: Isolates build and runtime phases, leveraging layer caching.

---

## How It Works

- Each `FROM` defines a stage, named with `AS <name>` (e.g., `AS builder`) or referenced by index (`--from=0`).
- Use `COPY --from=<stage>` to copy files from a previous stage (by name or index).
- Only the **final stage** is included in the output image; earlier stages are discarded.

---

## Example: Node.js Multi-Stage Dockerfile

```dockerfile
# sets the base image
FROM node:current-alpine3.22  AS builder
# sets the working directory for the container
WORKDIR /app
# copies the rest of the files to working directory
COPY . .
# install dependencies
RUN npm i --legacy-peer-deps
# build the app
RUN npm run build

# create a new stage to run the app
FROM node:current-alpine3.22
# set the working directory for the container
WORKDIR /app
# copy the package.json file to the container
COPY ./package.json ./package.json
# install the dependencies
RUN npm i --legacy-peer-deps
# copy the dist from the builder stage to the container
COPY --from=builder /app/dist ./dist
# expose the port 3000 which is the port that the server will run on
EXPOSE 3000
# set the command to run when the container starts
CMD ["npm","run","start:prod"]

```

**Stage 1**: Build (AS builder)

Base Image: node:current-alpine3.22 (~70MB, lightweight Alpine Linux).

Actions: Copies project files, installs dependencies (incl. dev), and builds the app.

Output: Temporary image with source code, node_modules, and compiled build.

**Stage 2**: Runtime

Base Image: Fresh node:current-alpine3.22.

Actions:

- Copies package.json.

- Installs runtime dependencies.

- Copies dist/ folder from Stage 1 with --from=builder.

- Exposes 3000.
- Runs npm run start:prod.  
  Output: Lean image (~100–200MB) with dist, minimal node_modules, and Node.js runtime.

- What’s Excluded? Source Code: src/, tests/, etc. (remain in Stage 1), dev tools (e.g., TypeScript, Webpack),.gitignore, README.md, etc. (unless explicitly copied).
- We can run the final image with `docker run -d --name my-cont -p 3030:3000 my-image`
