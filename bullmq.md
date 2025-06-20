# BULLMQ
-
- For performance reasons, the events emitted by a QueueEvents instance do not contain the Job instance, only the jobId. Use the Job.fromId method if you need the Job instance.

# Connection
- BullMQ uses the node module ioredis, and the options you pass to BullMQ are just passed to the constructor of ioredis
- Every class will consume at least one Redis connection, but it is also possible to reuse connections in some situations. For example, the Queue and Worker classes can accept an existing ioredis instance, and by that reusing that connection, however QueueScheduler and QueueEvents cannot do that because they require blocking connections to Redis, which makes it impossible to reuse them.
### Method 1
```typescript
const redisConfig: RedisOptions = {
    host: "localhost",
    port: 6379,
    password: "cibilex",
};

const myQueue = new Queue("email", { connection: redisConfig });
const worker = new Worker("email", async (payload) => {}, { connection: redisConfig });
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

When we publish a job using the `queue.add` method, BullMQ creates a hash in Redis with the format `bull:email:1`. You can see what data it holds by running `HGETALL bull:email:1` in Redis.

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

worker.on("completed", (job, returnValue) => {
    console.log(job.id, returnValue,job.returnValue., "job completed");
});
```


## Job Deletion

BullMQ provides several methods to delete jobs from queues. Understanding job states is important for proper cleanup:

**Job States:**
- `waiting`: Job is published and waiting to be processed
- `delayed`: Job has delay option and waiting for delay time to expire
- `active`: Job is currently being processed
- `completed`: Job finished successfully and stored in completed sorted set
- `failed`: Job failed during processing and stored in failed set

**Deletion Methods:**

`queue.drain()` removes all jobs in `waiting` and `delayed` states. It doesn't touch `active`, `completed`, or `failed` jobs. This is useful when you want to clear pending work without affecting jobs that are already processed or currently running.

`queue.obliterate()` removes all jobs regardless of their state. This completely clears the entire queue including all job data and metadata.

`queue.clean(grace, limit, jobStatus)` provides more granular control. The `grace` parameter is in milliseconds and deletes jobs older than this timestamp. For example, `queue.clean(60000, 1000, "failed")` means delete maximum 1000 failed jobs that are older than 1 minute.


