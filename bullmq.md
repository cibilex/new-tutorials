# BULLMQ

- For performance reasons, the events emitted by a QueueEvents instance do not contain the Job instance, only the jobId. Use the Job.fromId method if you need the Job instance.

# Connection

- BullMQ uses the node module ioredis, and the options you pass to BullMQ are just passed to the constructor of ioredis
- Every class will consume at least one Redis connection, but it is also possible to reuse connections in some situations. For example, the Queue and Worker classes can accept an existing ioredis instance, and by that reusing that connection. However ,QueueScheduler and QueueEvents cannot do that because they require blocking connections to Redis, which makes it impossible to reuse them.
  worker: `const worker = new Worker<MyData, MyReturn>(queueName, async (job: Job) => {});`

### Method 1

```typescript
const redisConfig: RedisOptions = {
  host: "localhost",
  port: 6379,
  password: "cibilex",
};

const myQueue = new Queue("email", { connection: redisConfig });
const worker = new Worker("email", async (payload) => {}, {
  connection: redisConfig,
});
```

### Method 2: IORedis Instance

```typescript
const connection = new IORedis(redisConfig);
const myQueue = new Queue("email", { connection });
const worker = new Worker("email", async (payload) => {}, { connection });
```

- Multiple BullMQ workers can't share the same Redis connection because blocking operations (BLPOP) would cause deadlock. BullMQ automatically creates separate internal connections for each worker to prevent this.
- Redis commands are retried when connection is lost. Default is `20` attempts before throwing error, but BullMQ requires `maxRetriesPerRequest: null` for workers to retry infinitely. This ensures workers keep running and automatically reconnect when Redis becomes available again.If not set to `null`, BullMQ throws "BullMQ: Your redis options maxRetriesPerRequest must be null" error.
- For queues (producers), use default maxRetriesPerRequest (20) or lower values like 1. This allows HTTP endpoints to fail quickly when Redis is down, giving users immediate errors instead of hanging indefinitely.
- Make sure that your redis instance has the setting `maxmemory-policy=noeviction` in order to avoid automatic removal of keys which would cause unexpected errors in BullMQ
- Naming conventions should use kebab-case or snake_case, not camelCase.

# BullMQ Working Mechanism

When we publish a job using the `queue.add` method, BullMQ creates a hash in Redis with the format `bull:email:1`. You can see what data it holds by running `HGETALL bull:email:1` in Redis.Also if you run `lrange bull:email:wait` command you should see that our job id is within the list.

```typescript
const myQueue = new Queue("email", {
  connection: {
    host: "localhost",
    port: 6379,
    password: "cibilex",
  },
});

const addJobs = async () => {
  const res = await myQueue.add("say-hi", { username: "chris" });
};
```

When a consumer starts up, BullMQ calls the callback function in the consumer. Here's an example consumer:

```typescript
const worker = new Worker(
  "email",
  async (payload) => {
    if (payload.data.username === "chris") {
      throw new Error("name is chris");
    }
    console.log(payload.data, "payload");
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
      password: "cibilex",
      maxRetriesPerRequest: null,
    },
  }
);
```

After a worker callback finishes,if the job completes successfully, it goes to the `completed` sorted set. If it throws an error, it goes to the `failed` sorted set. You can check this by running `ZRANGE bull:email:completed 0 -1` and you should see the job ID.

Notice that the job data `bull:email:1` still exists in Redis even after completion. This can create significant load in production environments. To prevent this, you can use `removeOnComplete` or `removeOnFail` options to automatically delete jobs after they're processed.

These options can take a number value. For example, `removeOnComplete: 100` means a maximum of 100 jobs can exist even after processing is complete. You can also use more advanced configurations:

```typescript
removeOnFail: {
    age: 24 * 3600, // keep up to 24 hours
},
removeOnComplete: {
    age: 3600, // keep up to 1 hour
    count: 1000, // keep up to 1000 jobs
},
```

When jobs are deleted, they are completely removed from all relevant parts of Redis. For example, if an email job with ID 4 is deleted, both `EXISTS bull:email:4` will return 0, and it won't be in the `ZRANGE bull:email:completed 0 -1` list.

Finally, keep in mind that when a new job is published, if a job with that ID already exists, the new job won't be published and a `duplicated` event will be triggered instead.

We can use both `removeOnComplete` and `removeOnFail` within the options of both `Worker` and `queue.add` functions.It depends us,If we want to add option per job,then add these to add function can be a better solution.

**Bulk Job Publishing**

- This operation is atomic - either all jobs are published or none of them are.

```ts
const [job1, job2] = await myQueue.addBulk([
  {
    name: "email",
    data: { username: "chris" },
    opts: { removeOnComplete: true, removeOnFail: true },
  },
  {
    name: "email",
    data: { username: "john" },
    opts: { removeOnComplete: true, removeOnFail: true },
  },
]);
```

Finally, keep in mind that when a new job is published, if a job with that ID already exists, the new job won't be published and a `duplicated` event will be triggered instead.

A completed job can return a value from the worker function. This return value can be accessed through `job.returnvalue` property or as the second parameter in the `completed` event listener:

```ts
const worker = new Worker("email", async (payload) => {
    return `welcome ${payload.data.username}`;
});

worker.on("active", (job) => {
    console.log(job.id, "job active");
});

worker.on("completed", (job, returnValue) => {
    console.log(job.id, returnValue,job.returnValue., "job completed");
});


worker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, {
        jobName: job?.name,
        jobData: job?.data,
        errorMessage: error.message,
        errorStack: error.stack,
        attemptsMade: job?.attemptsMade,
        maxAttempts: job?.opts?.attempts,
        failedReason: job?.failedReason,
        timestamp: new Date().toISOString(),
    });

    // Send alert for critical failures
    if (job?.attemptsMade >= job?.opts?.attempts) {
        console.error(`🚨 Job ${job.id} permanently failed after ${job.attemptsMade} attempts`);
    }
});

```

## Job Deletion

BullMQ provides several methods to delete jobs from queues. Understanding job states is important for proper cleanup:

**Job States:**

- `waiting`: Job is published and waiting to be processed.
- `waiting-children`: Job is published but waiting for its children to be completed.
- `delayed`: Job has delay option and waiting for delay time to expire.
- `active`: Job is currently being processed.
- `completed`: Job finished successfully and stored in completed sorted set.
- `failed`: Job failed during processing and stored in failed set.

**Deletion Methods:**

`queue.drain()` removes all jobs in `waiting` and `delayed` states. It doesn't touch `active`, `completed`, or `failed` jobs. This is useful when you want to clear pending work without affecting jobs that are already processed or currently running.

`queue.obliterate()` removes all jobs regardless of their state. This completely clears the entire queue including all job data and metadata.

`queue.clean(grace, limit, jobStatus)` provides more granular control. The `grace` parameter is in milliseconds and deletes jobs older than this timestamp. For example, `queue.clean(60000, 1000, "failed")` means delete maximum 1000 failed jobs that are older than 1 minute.
`remove`: also we can use `job.remove()` to a specific job just after create it with `queue.add`.

## Error handling

- The `error` listener prevents Node.js crashes when worker system errors occur. Without it, Redis connection failures will crash the entire process.If an `EventEmitter` does not have at least one listener registered for the `error` event, and an `error` event is emitted, the error is thrown, a stack trace is printed, and the Node.js process exits.

# BullMQ TypeScript Generic Types and Discriminated Unions

BullMQ generic types are defined as `Queue<JobData>` and `Worker<JobData, string>`. This means that every job in a queue must have the same data input and output type, which can be limiting when you need different job types with different payloads.We can solve this with TypeScript Unions like below

```ts
// producer.ts
import { Queue } from "bullmq";
import type { JobsOptions } from "bullmq";

// Job types as const object (Node.js strip-only mode compatible)
export enum JobTypes {
  WELCOME_EMAIL = "welcome_email",
  PASSWORD_RESET_EMAIL = "password_reset_email",
}

export interface WelcomeEmailJobData {
  type: JobTypes.WELCOME_EMAIL;
  to: string;
  userName: string;
  welcomeMessage?: string;
}

export interface PasswordResetEmailJobData {
  type: JobTypes.PASSWORD_RESET_EMAIL;
  to: string;
  resetToken: string;
  expiresAt: string;
}

// Discriminated union type
export type JobData = WelcomeEmailJobData | PasswordResetEmailJobData;

// Create queue with TypeScript types
const myQueue = new Queue<JobData>("email", {
  connection: {
    host: "localhost",
    port: 6379,
    password: "cibilex",
  },
});

const jobOptions: JobsOptions = {
  removeOnComplete: true,
  removeOnFail: true,
};

const addJobs = async (): Promise<void> => {
  try {
    // WELCOME_EMAIL job with specific payload
    const res = await myQueue.add(
      JobTypes.WELCOME_EMAIL,
      {
        type: JobTypes.WELCOME_EMAIL,
        to: "user@example.com",
        userName: "John Doe",
        welcomeMessage: "Welcome!",
      },
      jobOptions
    );

    // PASSWORD_RESET_EMAIL job with different payload
    const res2 = await myQueue.add(
      JobTypes.PASSWORD_RESET_EMAIL,
      {
        type: JobTypes.PASSWORD_RESET_EMAIL,
        to: "user@example.com",
        resetToken: "reset_token_123",
        expiresAt: "2024-01-15T10:00:00Z",
      },
      jobOptions
    );

    console.log(res, res.id, "published");
  } catch (error) {
    console.error("Failed to add job:", error);
  }
};

addJobs();
```

```typescript
// consumer.ts
import { Worker } from "bullmq";

import {
  JobData,
  JobTypes,
  PasswordResetEmailJobData,
  WelcomeEmailJobData,
} from "./producer";

// Redis connection config
const connectionConfig = {
  host: "localhost",
  port: 6379,
  password: "cibilex",
  maxRetriesPerRequest: null,
};

// Job processing functions
const processWelcomeEmail = async (
  data: WelcomeEmailJobData
): Promise<string> => {
  return `Welcome email sent to ${data.userName} at ${data.to}`;
};

const processPasswordResetEmail = async (
  data: PasswordResetEmailJobData
): Promise<string> => {
  return `Password reset email sent to ${data.to}, expires at ${data.expiresAt}`;
};

const worker = new Worker<JobData, string>(
  "email",
  async (job) => {
    const { data } = job;

    // Discriminated union switch statement
    switch (data.type) {
      case JobTypes.WELCOME_EMAIL:
        return await processWelcomeEmail(data);

      case JobTypes.PASSWORD_RESET_EMAIL:
        return await processPasswordResetEmail(data);

      default:
        throw new Error(`Unknown job type: ${(data as any).type}`);
    }
  },
  {
    connection: connectionConfig,
  }
);

// Worker event handlers
worker.on("active", (job) => {
  console.log(`Job ${job.id} (${job.data.type}) started processing`);
});

worker.on("completed", (job, returnValue) => {
  console.log(`Job ${job.id} (${job.data.type}) completed:`, returnValue);
});

worker.on("failed", (job, error: Error) => {
  console.error(`Job ${job?.id} failed:`, {
    jobName: job?.name,
    jobType: job?.data?.type,
    jobData: job?.data,
    errorMessage: error.message,
    timestamp: new Date().toISOString(),
  });
});

// The 'error' listener prevents Node.js crashes when worker system errors occur.
// Without it, Redis connection failures will crash the entire process.
worker.on("error", (err: Error) => {
  console.error("🔥 Worker system error occurred:", {
    errorMessage: err.message,
    errorStack: err.stack,
    workerName: "email",
  });
});
```

### BullMQ Concurrency

BullMQ offers 2 options for concurrent processing:

1. **concurrency option**: Works the same way as Node.js request handling mechanism. Since the worker runs as a Node.js process, it starts processing the next job during async operations (DB or external requests), essentially performing one unit of work per unit of time.
   - ```ts
     const worker = new Worker(
       "email",
       async (job) => {
         //  do something
       },
       {
         connection: {},
         concurrency: 100,
       }
     );
     ```
1. **multiple workers**: This is the recommended approach when concurrent processing is needed. This method duplicates the worker to run in different Node.js processes.

ShutDown worker: In order to shutdown worker, use `worker.close()`

# BullMQ Job Processing Order

- By default, BullMQ uses `FIFO` (First In, First Out) as the job processing strategy. This means jobs are processed in the order they were added to the queue - the first job added will be the first job processed.In important scenarios where certain jobs need to be processed before others, you can use the `lifo: true` option when adding jobs to the queue. This changes the processing order to **LIFO (Last In, First Out)**.

```typescript
// Default FIFO processing (jobs processed in order of addition)
myQueue.add("welcome_email", {});

// Priority LIFO processing - this job will be processed before others
myQueue.add("welcome_email", {}, { lifo: true });
```

- **Custom Job ID**: In order to specify a custom job id, use the jobId option when adding jobs to the queue:

```ts
await myQueue.add(
  "wall",
  { color: "pink" },
  {
    jobId: customJobId,
  }
);
```

- **Delayed Jobs**: Delayed jobs allow us to specify that a job will not run until a specified time. This is useful for scheduling tasks to execute at a future time. Delay is specified in **milliseconds**.**Be aware that the job may not run exactly when the delay is completed, as the worker can be busy processing other jobs.**. `myQueue.add("welcome_email", { userId: 123 }, { delay: 5000 });`

- **job getters**:
  - **getJobCountByTypes()**: Returns the **total number** of jobs across specified statuses. `myQueue.getJobCountByTypes("wait", "delayed");`
  - **getJobCounts()**: Returns an **object** with individual counts for each specified status. `myQueue.getJobs(['completed'], 0, 100, true);`
