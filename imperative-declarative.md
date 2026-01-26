# Imperative vs declarative programming

- **Imperative programming** is about how to achieve a goal. You describe every step, control how things happen, and directly manipulate the system.
- **Declarative programming** is about what you want to achieve. You describe the final result and let the framework handle the steps.
- The face-washing example fits well: In imperative style, you explain each action like turning on the tap and washing your face. In declarative style, you simply say “wash your face”.
**Imperative approach**: This style manually creates elements, assigns text, and attaches event handlers step by step, so the developer controls the entire process.
```ts
function getButton(text: string) {
  const div = document.createElement("div");
  div.textContent = text;
  div.onclick = () => {
    // open modal
  };
  return div;
}
```
- **Declarative approach**: This style describes the UI state and behavior, while React handles DOM updates internally.
```jsx
<Button text="hi world" onClick={() => {}} />
```
- C and C++ are mainly imperative, SQL and HTML are declarative, and JavaScript and Python support both styles. React and Vue provide a declarative way to build UIs, while Express is largely imperative. Declarative and imperative are programming styles, not strict language categories.
- Declarative code does work with state, but it does not manage how the state is mutated step by step.
This reduced coupling is what makes migration easier.