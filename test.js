const numbers = {
  x: 1,
  y: 2,
};
let target;
Object.keys(numbers).forEach((key) => {
  const subscribers = [];
  let val = numbers[key];
  Object.defineProperty(numbers, key, {
    get() {
      if (target && !subscribers.includes(target)) subscribers.push(target);
      return val;
    },
    set(value) {
      val = value;
      subscribers.forEach((fn) => fn());
      return val;
    },
  });
});

let total = 0;
const watcher = (fn) => {
  target = fn;
  target();
  target = null;
};

watcher(() => {
  total = numbers.x + numbers.y;
});

console.log(total);

numbers.x = 12;

console.log(total);
