```ts
// first vue handling reactivity
const user = { firstName: "cibilex", lastName: "anderson" };
let fullName = "";
let target: (() => void) | null;

class Dep {
  subscribers: (() => void)[];
  constructor() {
    this.subscribers = [];
  }

  depend(t: (() => void) | null) {
    if (t && !this.subscribers.includes(t)) {
      this.subscribers.push(t);
    }
  }

  notify() {
    this.subscribers.forEach((fn) => fn());
  }
}

const dep = new Dep();

Object.keys(user).forEach((key) => {
  let externalVal = user[key as keyof typeof user];

  Object.defineProperty(user, "firstName", {
    get() {
      dep.depend(target);
      return externalVal;
    },

    set(val) {
      externalVal = val;
      dep.notify();
    },
  });
});

function watch(t: () => void) {
  target = t;
  target();
  target = null;
}

watch(() => {
  fullName = `${user.firstName} ${user.lastName}`;
});

let info;
watch(() => {
  info = `${user.firstName} ${user.firstName}`;
});

console.log(fullName);
console.log(info);

user.firstName = "ahmet";

console.log(fullName);
console.log(info);
```