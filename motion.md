# Motion

- Motion can be used with vanilla JS,Vue ,React or other libraries.We will use motion with React.
- Installation: `npm i motion`
- Example usage:

```tsx
import { motion } from "motion/react";
<motion.div
  className=" w-10 h-10 rounded-full bg-red-200"
  transition="{{duration:3}}"
  animate="{{
  width:200,
  height:200,
  }}"
></motion.div>;
```

Motion uses default values for animation transition but we can change with `transition` option.

- `duration`: animation time in second
- `delay`: animation delay in second
- `ease`: transition flow
  Also we can specify value specific like below

```tsx
<motion.div
  animate={{
    translateX: 0,
    translateY: 100,
    backgroundColor: "oklch(50.8% 0.118 165.612)",
  }}
  initial={{
    translateX: -200,
    backgroundColor: "oklch(98.6% 0.031 120.757)",
  }}
  transition={{
    duration: 0.2,
    backgroundColor: {
      duration: 2,
    },
  }}
  className="w-32 grid  place-content-center border text-white p-4 m-3 rounded-xl"
>
  hi world
</motion.div>
```

- Motion works well with hex or rgba colors. Use them instead of direct specifications such as `red`, `green`.
- Motion css değişkenlerini kullanabilir. Mesela `backgroundColor: 'var(--color-brand-accent)'`

- Motion also extends provides evet listeners and styles based on evets for example

  - `whileHover: VariantLabels | TargetAndTransition` : hover styles
  - `whileTap:  VariantLabels | TargetAndTransition`: tap styles
  - `onHoverStart:(event: MouseEvent, info: EventInfo): void` : is fired on hover start
  - `onHoverEnd:(event: MouseEvent, info: EventInfo): void` : is fired on hover end
  - Also provides more events such as `whileFocus` and `whileDrag`.

- Also we can use scroll animations with `whileInView`. This option use another option `viewport`

  - `viewport` optins:
    - `once:boolean=false`: One time animation or infinity.
    - `amount:0-1 | "some" | "all" ="some"`: the amount of the element should be entered in the viewport.

- Also we can use `useScroll` hook to get the current scrool ratios.`https://motion.dev/docs/react-use-scroll`

### Variants

- Variants are just predefined motion attributes.The key name is arbitrary.This approach helps us to generate common variants and orchestrate the animations.Let's start this example

```ts
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Variants } from "motion/react";

export const Route = createFileRoute("/login/")({
  component: RouteComponent,
});

const list: Variants = {
  visible: { opacity: 1, scale: 1 },
  hidden: { opacity: 0, scale: 0 },
};

const item: Variants = {
  visible: { opacity: 1, x: 0 },
  hidden: { opacity: 0, x: -100 },
};

function RouteComponent() {
  const [isVisible, setIsVisible] = useState(true);
  return (
    <>
      <button onClick={() => setIsVisible(!isVisible)}>Toggle</button>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="flex flex-col gap-2 bg-red-100"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={list}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <motion.div
                className="w-32 bg-red-400 grid place-content-center border p-4 m-3 rounded-xl text-white"
                variants={item}
                key={index}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

- I'll provide a video that demonstrate the basic animation.
- As you can see our animation is looks wierd. We need two basic features here

  - Our parent should be affected first while entering, and should be affected later while exiting.
  - Our children should be delayed by the index order.For example the second item should be affected after first one.

- Solution for problem 1: motion provides `when` field for variants. The value is false as default, that is all the elements are affected concurrently.We can use
  - `beforeChildren`: to be affected before its children
  - `afterChildren`: to be affected after its children
    So we just need to change the parent variant like below:

```tsx
const list: Variants = {
  visible: { opacity: 1, scale: 1, transition: { when: "beforeChildren" } },
  hidden: { opacity: 0, scale: 0, transition: { when: "afterChildren" } },
};
```

- I'll provide a video that demonstrate the solution.
- As you can see our animation looks smoother now.Let's try to solve the problem two.
  - I want a sequantial animation. Items should be entered by ascending index number and items should be exited by descending index number.To do this, we can use dynamic variants:

```tsx
// item variant section
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Variants } from "motion/react";

export const Route = createFileRoute("/login/")({
  component: RouteComponent,
});

const list: Variants = {
  visible: { opacity: 1, scale: 1, transition: { when: "beforeChildren" } },
  hidden: { opacity: 0, scale: 0, transition: { when: "afterChildren" } },
};

export type ItemVariantProps = { index: number; total: number };
const item: Variants = {
  visible: ({ index }: ItemVariantProps) => ({
    opacity: 1,
    x: 0,
    transition: { delay: index * 0.1 },
  }),
  hidden: ({ index, total }: ItemVariantProps) => {
    return {
      opacity: 0,
      x: -100,
      transition: { delay: (total - index - 1) * 0.1 },
    };
  },
};

function RouteComponent() {
  const [isVisible, setIsVisible] = useState(true);
  const items = Array.from({ length: 4 });
  const totalItems = items.length;

  return (
    <>
      <button onClick={() => setIsVisible(!isVisible)}>Toggle</button>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="flex flex-col gap-2 bg-red-100"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={list}
          >
            {items.map((_, index) => (
              <motion.div
                className="w-32 bg-red-400 grid place-content-center border p-4 m-3 rounded-xl text-white"
                variants={item}
                custom={{ index, total: totalItems }}
                key={index}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

- I'll provide a video that demonstrate the solution.
- As you can see we solved our problems easily.
- Instead of this solution also we can use motion `stagger` strategy like below

```tsx
const list: Variants = {
  visible: {
    opacity: 1,
    scale: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.1 },
  },
  hidden: {
    opacity: 0,
    scale: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.1,
      staggerDirection: -1,
    },
  },
};
```

After now on, you got the control. You can create fancier animations like below:

```tsx
const item: Variants = {
  visible: { opacity: 1, x: 0, y: 0 },
  hidden: ({ index }: { index: number }) => ({
    opacity: 0,
    x: index % 2 === 0 ? -100 : 100,
    y: index === 0 ? -50 : index === 3 ? 50 : 0,
  }),
};
```

That's it. Thanks for taking time to read my article.

---

- **Layout**: Motion can handle unanimatable CSS values.That's whole new ball game :).For example `justify-start`,`ml-auto` or some of the other CSS values cannot be animated,with this feature,we can make them animatable.
- **LayoutGroup** is used to group components that might not render together but do affect each-other's state.

```jsx
import { motion } from "motion/react";
import { useCallback, useState } from "react";

function App() {
  const [position, setPosition] =
    (useState < "ml-auto") | ("mr-auto" > "ml-auto");
  const handleClick = useCallback(() => {
    setPosition(position === "ml-auto" ? "mr-auto" : "ml-auto");
  }, [setPosition, position]);

  return (
    <>
      <button onClick={handleClick}>toggle</button>
      <div className=" h-screen w-full bg-red-300 p-12 flex items-center">
        <motion.div
          layout
          className={" w-20 h-20  rounded-full bg-red-200 " + position}
        ></motion.div>
      </div>
    </>
  );
}

export default App;
```

- **layoutId**: makes smooth animation if they related with each other like below one.

```jsx
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

interface Tab {
  title: string;
  className: string;
}
const tabs: Tab[] = [
  {
    title: "Users",
    className: "bg-green-400",
  },
  {
    title: "settings",
    className: "bg-yellow-400",
  },
  {
    title: "books",
    className: "bg-purple-400",
  },
];

function Container({ tab }: { tab: Tab }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      exit={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={
        "w-full h-40  rounded-b-xl bg-green-400 grid place-content-center text-3xl italic text-white " +
        tab.className
      }
    >
      {tab.title}
    </motion.div>
  );
}

function App() {
  const [tab, setTab] = useState < Tab > tabs[0];
  const handleTab = (tab: Tab) => {
    setTab(tab);
  };
  return (
    <div className=" flex gap-3 flex-col ">
      <Toolbar tab={tab} handleTab={handleTab} />
      <div className="px-10 py-4 ">
        <div className=" flex flex-col gap-2 ">
          <div className=" capitalize text-xl font-medium  flex items-center gap-1 ">
            <span>|</span> {tab.title}
          </div>
          <AnimatePresence mode="wait">
            <Container key={tab.title} tab={tab} />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Toolbar({
  tab,
  handleTab,
}: {
  tab: Tab,
  handleTab: (tab: Tab) => void,
}) {
  return (
    <div className=" grid grid-cols-3   ">
      {tabs.map((item) => (
        <button
          key={item.title}
          onClick={() => {
            handleTab(item);
          }}
          className="relative p-2"
        >
          {tab.title}
          {tab.title === item.title && (
            <motion.span
              layoutId="toolbar"
              className=" absolute top-full left-0 right-0 h-1 bg-purple-400"
            ></motion.span>
          )}
        </button>
      ))}
    </div>
  );
}

export default App;
```

- **AnimatePresence**: allow us to use `exit` animation prop.When removing an element to animate back to its origin layout, AnimatePresence can be used to keep it in the DOM until its exit animation has finished.
- AnimatePresence mode:
  1.  **sync**: Default,Children animate in/out as soon as they're added/removed.
  2.  **wait**: The entering child will wait until the exiting child has animated out. Note: Currently only renders a single child at a time.
  3.  **popLayout**: Exiting children will be "popped" out of the page layout. This allows surrounding elements to move to their new layout immediately.
- **onExitComplete**: Fires when all existing nodes have completed.
- **propagate**: If set to true, exit animations on children will also trigger when this AnimatePresence exits from a parent AnimatePresence.
- Note:

```jsx
<AnimatePresence>
  {show ? (
    <motion.section exit={{ opacity: 0 }}>
      <AnimatePresence>
        {/*
          * When `show` becomes `false`, exit animations
          * on these children will not fire.
          */}
        {children}
      </AnimatePresence>
    </motion.section>
  ) : null}
</AnimatePresence>

// but
<AnimatePresence>
  {show ? (
    <motion.section exit={{ opacity: 0 }}>
      <AnimatePresence propagate>
        {/*
          * When `show` becomes `false`, exit animations
          * on these children **will** fire.
          */}
        {children}
      </AnimatePresence>
    </motion.section>
  ) : null}
</AnimatePresence>
```

---

🧩 Problem

You have an element like this:

<div className="relative w-full grow items-center flex">
  <IconButton className="!absolute -top-4 right-0">hi</IconButton>
</div>

You want the IconButton to appear with an animation when the parent element is hovered.
Using a React isHovered state works but feels unnecessary and a bit clunky — so you want a cleaner Framer Motion–based approach.

✅ Solution

Use Framer Motion’s whileHover and variants instead of managing hover state manually.
This way, you can animate child elements when the parent is hovered without extra React state.

Example:

import { motion } from "framer-motion";
import { IconButton } from "@mui/material";

export default function HoverExample() {
return (
<motion.div
className="relative w-full grow flex items-center"
whileHover="hover"
initial="rest"
animate="rest" >
<motion.div
variants={{
          rest: { opacity: 0, y: -10, pointerEvents: "none" },
          hover: { opacity: 1, y: 0, pointerEvents: "auto" },
        }}
transition={{ duration: 0.3, ease: "easeOut" }}
className="absolute -top-4 right-0" >
<IconButton>hi</IconButton>
</motion.div>
</motion.div>
);
}

💡 Notes

whileHover="hover" triggers the "hover" variant on all child motion elements.

pointerEvents: "none" ensures the hidden button doesn’t block hover events.

No React state (isHovered) is needed — Framer Motion handles the interaction declaratively.
