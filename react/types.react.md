# ⚛️ React Types

### 1. Types Defining Component Constructors (The Blueprints)

- These types refer to the **component's definition**—the function or class itself. They are what you use as the first argument to `React.createElement`.

| Type | Description | Included | Excluded |
| :--- | :--- | :--- | :--- |
| **`FC<P>`** / **`FunctionComponent<P>`** | Defines a standard Function Component accepting props of type `P`. | Function Components | Class Components, HTML Tags |
| **`ComponentClass<P>`** | Defines a standard Class Component accepting props of type `P`. | Class Components | Function Components, HTML Tags |
| **`ComponentType<P>`** | Union of `FC<P>` and `ComponentClass<P>`. | Function/Class Components | **Intrinsic HTML Tags (strings)** |
| **`ElementType<P>`** | The most permissive constructor type. | Components **and** Intrinsic HTML Tags. | N/A |


```typescript
// ComponentType ONLY accepts components (functions/classes)
const componentsA: React.ComponentType[] = [
  Home,
  // "div" // ❌ ERROR: Type 'string' is not assignable to type 'ComponentType'.
];

// ElementType accepts both components and HTML tags (strings)
const componentsB: React.ElementType[] = [
  Home,
  "div", // ✅ Valid
];

type ImageProps = { src: string };

const componentsC: React.ElementType<ImageProps>[] = [
  "img", // ✅ Valid: The 'img' tag accepts a 'src' prop.
  // Home, // ❌ ERROR: Home component is incompatible (doesn't accept { src: string }).
];
```



### 3. Types Defining Rendered Output (The Products) 🖼️

- These types define the results of a component's rendering—the specific instructions or content React uses to build the UI.

| Type | Definition | Key Characteristics | Common Use Case |
| :--- | :--- | :--- | :--- |
| **`ReactElement<P>`** | The **specific, immutable JavaScript object** created by processing JSX (or `React.createElement`). It is the primary building block of the Virtual DOM. | Has a defined `type` (Component or HTML tag) and `props`. **Cannot** be a primitive value (`string`, `number`, `null`). | Internally by React; technically the return type of JSX. |
| **`JSX.Element`** | An **alias** for `ReactElement<any, any>`. | Function components (FCs) often use this as their explicit return type. | Explicit return type for Function Components. |
| **`ReactNode`** | The most **permissive** type; it represents **any valid content React is capable of rendering**. | Includes **Elements**, **Arrays of Elements**, **Strings**, **Numbers**, **Booleans**, `null`, and `undefined`. | Typing the **`children`** prop. |

> **Analogy:** Think of the **Component** (the blueprint) that returns a **ReactElement** (the specific instruction card) that sits alongside other **ReactNodes** (any valid content) in the final rendered output.


### 4. Practical Application: React.createElement

The first argument to React.createElement must be an ElementType because it needs to accept both a custom component and an intrinsic HTML tag string.

```ts
import React, { createElement, ElementType } from 'react';

type MyComponentProps = { title: string };

function MyComponent({ title }: MyComponentProps) {
  return <h1>{title}</h1>
}

// 'elem' is constrained to be an ElementType that accepts MyComponentProps
function Hi({ elem }: { elem: ElementType<MyComponentProps> }) {
  return createElement(elem, { title: "Hello" });
}

function World() {
  return (
    <div>
      {/* Passing a Function Component (MyComponent) */}
      <Hi elem={MyComponent} /> 
      {/* Passing an Intrinsic HTML Tag (if it accepted 'title') */}
      <Hi elem="h1" />            
    </div>
  );
}

export default World;
```