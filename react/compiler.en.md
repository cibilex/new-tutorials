Let's create a final example with a subtle trick:

```ts
import { useState } from "react";
// Bu fonksiyonu anlamanız gerekmez. Sadece uzun süren bir işlem olduğunu bilin
const expensiveCalculation = () => {
  console.info("expensiveCalculation çalışıyor");
  let result = 0;

  // CPU-yoğun döngüler
  for (let i = 0; i < 5000; i++) {
    for (let j = 0; j < 5000; j++) {
      result += Math.sin(i) * Math.cos(j);
    }
  }

  // Yavaş rekürsif Fibonacci
  const fib = (n: number): number => (n <= 1 ? n : fib(n - 1) + fib(n - 2));
  for (let i = 0; i < 25; i++) fib(i);

  return result;
};

export default function App() {
  console.info("app render ediliyor");
  const [count, setCount] = useState(0);
  const handleClick = () => {
    setCount((prev) => prev + 1);
  };
  const result = expensiveCalculation();

  return (
    <>
      <div>Sayaç: {count}</div>
      <ButtonChild onButtonClick={handleClick} />
      <p>Pahalı Hesaplama: {result}</p>
      <Footer />
    </>
  );
}

function ButtonChild({ onButtonClick }: { onButtonClick: () => void }) {
  "use memo";
  console.info("ExpensiveChild render ediliyor");

  return <button onClick={onButtonClick}>Alt bileşenden artır</button>;
}

function Footer() {
  "use memo";
  console.info("footer render ediliyor");

  return <div>Altbilgi</div>;
}
```

// I'll add a video to demonstrate React Compiler is not working.

As you can see, while we added `use memo` annotation to both `ButtonChild` and `Footer` they still wasn't memoized.The reason why it didn't worked is we added `use memo` annotation to child components and they are not the reason of re-renders. To solve the problem we have to write the `use memo` annotation to App component itself.

```ts
import { useState } from "react";
// you don't need to understand this function.Just know that it's a function that takes a long time to execute
const expensiveCalculation = () => {
  console.info("expensiveCalculation running");
  let result = 0;

  // CPU-intensive loops
  for (let i = 0; i < 5000; i++) {
    for (let j = 0; j < 5000; j++) {
      result += Math.sin(i) * Math.cos(j);
    }
  }

  // Slow recursive Fibonacci
  const fib = (n: number): number => (n <= 1 ? n : fib(n - 1) + fib(n - 2));
  for (let i = 0; i < 25; i++) fib(i);

  return result;
};

export default function App() {
  "use memo";
  console.info("app rendering");
  const [count, setCount] = useState(0);
  const handleClick = () => {
    setCount((prev) => prev + 1);
  };
  const result = expensiveCalculation();

  return (
    <>
      <div>Count: {count}</div>
      <ButtonChild onButtonClick={handleClick} />
      <p>Expensive Calculation: {result}</p>
      <Footer />
    </>
  );
}

function ButtonChild({ onButtonClick }: { onButtonClick: () => void }) {
  console.info("ExpensiveChild rendering");

  return <button onClick={onButtonClick}>Increment from child</button>;
}

function Footer() {
  console.info("footer rendering");

  return <div>Footer</div>;
}
```

// I'll add a video to demonstrate memoization works well.

Let me add final notes:

1. React Compiler is also known as React forger.
2. React Compiler adds an extra layer at the compile time to perform performance optimizations.It skips a component if come across with the code which can cause bugs.
