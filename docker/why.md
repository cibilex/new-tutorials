# Why we should use VM/Containers

Imagine we are running Service X and Service Y on a single Ubuntu 22.04 server. Sounds simple, right? In reality, it’s like forcing two sworn enemies to share a studio apartment—someone’s bound to crash.
| Dependency | Service X | Service Y |
| ---------- | --------- | --------- |
| Node.js | 14 | 20 |
| Express.js | 4 | 5 |
| Database | MySQL 5.7 | MongoDB 6 |
| Caching | Redis 4 | Redis 7 |

1. **Express**: Express doesn’t cause drama. Since it’s managed inside each project’s package.json, Service X can use Express 4 and Service Y can use Express 5 without any conflicts
2. **NodeJS**: Service X runs on Node 14, while Service Y insists on Node 20. That means constantly switching with nvm use. Forget to switch once? Service X crashes instantly.Also tools like PM2 don’t handle multiple Node versions gracefully. And if the OS decides to upgrade Node to 18+ during an update? We end up with mysterious bugs that consume our entire weekend.
3. **Databases**: MongoDB’s heavy disk I/O can slow down the entire server, dragging MySQL performance with it. A crash in one can ripple into the other—suddenly both databases are unhappy, and so are we.
4. **Redis**: Both services need Redis, but one clings to version 4 while the other demands version 7. That means duplicate configs, awkward port juggling, and the eternal question: “Which Redis are we actually connected to?”

### Other Obstacles

1. **Manual environment setup**: Every deployment requires configuring the environment by hand. Something that works in testing may collapse in production because the environments don’t quite match.
2. **Rollback pain**: Rolling back after a failed update is tough. Without snapshots or container images, we are left debugging live instead of simply reverting to a clean state.
3. **Cascading crashes**: One tool crashing (say, MongoDB hogging disk or Redis dying under load) can take the entire stack down with it. Without isolation, one domino falling brings down the whole system.

So here we are :) We need to use VM or containers to solve all of this problems.VMs and containers give each service its own isolated environment, eliminating these conflicts entirely.
