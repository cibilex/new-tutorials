

// I will add a video that shows why this file is not working. Video 4
As you can see memoization operation didn't worked even though we explicitly opt-in component with `use memo` annotation.The reason why it's not worked is we opt-in sub components which are not the reason re-renders.Let's opt-in `App.tsx` component itself and see the result.

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

// I'll add a video that shows the memoization.
That's it.

Last Notes:

1. `React compiler` is also known as `React forget`.
2. React compiler adds another layer of code interpretation during the build process to optimize performance.And when it come across with a component that memoization might break the logic, it passes and skip the next one.

//
