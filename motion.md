# Motion
- Motion can be used with vanilla JS,Vue ,React or other libraries.We will use motion with React.
- Installation: `npm i motion`
- Example usage:
```html
<motion.div className=" w-10 h-10 rounded-full bg-red-200" transition={{duration:3}}  animate={{
width:200,
height:200,
}}></motion.div>
``` 

- Motion also extends provides evet listeners and styles based on evets for example
   - `whileHover: VariantLabels | TargetAndTransition` : hover styles
   - `onHoverStart:(event: MouseEvent, info: EventInfo): void` : is fired  on hover start
   - `onHoverEnd:(event: MouseEvent, info: EventInfo): void` : is fired on hover end
   - Also provides more events such as `whileFocus` and `whileDrag`.
  
- **Layout**: Motion can handle unanimatable CSS values.That's whole new ball game :).For example `justify-start`,`ml-auto` or some of the other CSS values cannot be animated,with this feature,we can make them animatable.
- **LayoutGroup** is used to group components that might not render together but do affect each-other's state.
```jsx
import { motion } from "motion/react";
import { useCallback, useState } from "react";

function App() {
  const [position, setPosition] = useState<"ml-auto" | "mr-auto">("ml-auto");
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
  const [tab, setTab] = useState<Tab>(tabs[0]);
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
  tab: Tab;
  handleTab: (tab: Tab) => void;
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
  3.  **popLayout**:  Exiting children will be "popped" out of the page layout. This allows surrounding elements to move to their new layout immediately.
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