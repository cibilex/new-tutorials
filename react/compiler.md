# React compiler

Until now we've used `useCallback` for functions,`useMemo` for complex calculations,`memo` for component memoization to reduce unnecessary re-renders.This helpers are great but make the coding tedious and complex.On the other hand, `react-compiler` turned out to do all these works with just a small configuration.It's a babel plugin that automatically memoizes components, hooks, and expensive calculations to prevent unnecessary re-renders by analyzing the component’s code at compile time.

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

`eslint-plugin-react-hooks` is a package that helps warn us when we violates react rules and it comes with most of the templates.So if you created your project with vite,It might be already installed.React compiler is still under development,so we should install `eslint-plugin-react-hooks` with `@rc` (release candidate) flag to get compiler rules too.

```bash
npm install -D eslint-plugin-react-hooks@rc
```

```ts
// .eslintrc.js
    rules: {
      "react-hooks/react-compiler": "error",
    }
```

That's it.Let's revoke our App.tsx changes which are performed to solve re-rendering problem.

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

## Incremental Adoption:

If our project is already in production, even though it’s unlikely to cause side effects, it is a recommended approach to add React Compiler incrementally.
There are three ways to add `react-compiler` incrementally to your app.

1. **Path specific**: We can configure babel to run this compiler in just specific paths.

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [], // Ensure no global babel-plugin-react-compiler here
        overrides: [
          {
            test: [/src\/components\/with-compiler\/.*\.(js|jsx|ts|tsx)$/],
            plugins: ["babel-plugin-react-compiler"],
          },
        ],
      },
    }),
  ],
});
```

React compiler will run only it's in files within `src/components/with-compiler`.

1. **Annotation mode**: The second way is using annotation mode so that react-compiler runs for components with `use memo;` annotation.

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            "babel-plugin-react-compiler",
            {
              compilationMode: "annotation",
            },
          ],
        ],
      },
    }),
  ],
});
```

Then we can use the `use memo;` annotation on any component we want React Compiler to work on.Let's review below example.Be aware that it includes a subtle trick :)

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
  "use memo";
  console.info("ExpensiveChild rendering");

  return <button onClick={onButtonClick}>Increment from child</button>;
}

function Footer() {
  "use memo";
  console.info("footer rendering");

  return <div>Footer</div>;
}
```

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
