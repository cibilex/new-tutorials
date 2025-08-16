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

- **`docker images`** – Lists all images on your local machine.

- **`docker rmi NAME[:TAG]`** – Removes an image from your local machine.

  - `docker rmi redis:bookworm`

- **`docker inspect NAME[:TAG]`** – Shows detailed information about an image, including layers, environment variables, default command, and metadata.
  - `docker inspect redis:bookworm`
