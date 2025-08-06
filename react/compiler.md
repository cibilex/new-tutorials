# React compiler

Let's create a basic example to understand react compiler:

```bash
create-vite react-compiler --template react-ts
cd react-compiler
npm i
npm run dev
```

With above commands,We created a react app with vite and run the project.If you look at the `http://localhost:5173`, you should see the running app.

Let's install react-scan to catch the re-renders better.

```bash
npm i react-scan
```

and configure `main.tsx` file to enable react-scan

```ts
// import { StrictMode } from "react"; // remove this line to disable double render
import { createRoot } from "react-dom/client";
// import "./index.css"; // remove this line to disable css
import App from "./App.tsx";
import { scan } from "react-scan"; // must be imported before React and React DOM

scan({
  enabled: true,
});
createRoot(document.getElementById("root")!).render(<App />);
```

The last thing is configuring App.ts file to start our explanation:

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

- I will include screen record here to show initial example.
- As you can see both child components and `expensiveCalculation` are triggered in every click event although `count` is used by App component itself.This attitude brings a huge cost in the real projects.Until now,we used to add `useMemo`,`useCallback` and `memo` hooks to prevent re-rendering problems.Let's add them to see what will be happened.

```ts
import { memo, useCallback, useMemo, useState } from "react";
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
  console.info("app rendering");
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);
  const result = useMemo(() => expensiveCalculation(), []);

  return (
    <>
      <div>Count: {count}</div>
      <ButtonChild onButtonClick={handleClick} />
      <p>Expensive Calculation: {result}</p>
      <Footer />
    </>
  );
}

const ButtonChild = memo(({ onButtonClick }: { onButtonClick: () => void }) => {
  console.info("ExpensiveChild rendering");

  return <button onClick={onButtonClick}>Increment from child</button>;
});

const Footer = memo(() => {
  console.info("footer rendering");

  return <div>Footer</div>;
});
```

// I will add a video to show the performance upgration
As you can see we did a lot of work to solve the re-rendering problem and our project completexity increased for just this tedious work.React compiler solve this problems automatically by default.Be aware that this installation is for vite.You should click here to see installation ways for different platforms

```bash
npm install -D babel-plugin-react-compiler@rc
```

```js
// babel.config.js
module.exports = {
  plugins: [
    "babel-plugin-react-compiler", // must run first!
    // ... other plugins
  ],
  // ... other config
};
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
});
```

And revoke our App.tsx changes which are performed to solve re-rendering problem.

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

// I will add a proper video to show performance upgration

- As you can see react compilers did the same thing without any code refactoring and complexity.This looks great but we should see that why and when to use this compiler,and when not to do it.

- No need any configuration for react react@19+ but we should make a bit effort to use react-compiler for older versions(React compiler supports react@17+) versions.Click here to see the steps.Also this guide includes vite configuration,click here to go installation [page](https://react.dev/learn/react-compiler/installation).
- To verify react-compiler installation, you should see `✨` text next to `Component` tab.

**Opting out specific components**: If somehow react-compiler causes unexpected behaviours, we can use `"use no memo";` at the starting of the related component to disable react-compiler for specific component.

```ts
export default function App() {
  "use no memo";
  // ...
}
```
