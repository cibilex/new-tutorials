# React
- Predictable functions help prevent unexpected application behavior. To make code predictable, we follow two main rules: no side effects and consistent results.
  - **No side effects** means a function should not mutate its inputs or rely on external application state.
  - **Consistent results** means a function should always return the same output for the same input arguments.
  - Following these rules makes functions predictable. Impure or inconsistent functions are not inherently bad, but they are harder to reason about because their output depends on external factors.
- **Code example fix**
```js
// This function is impure because it depends on the external TAX_RATE.
function calculateFinalPrice(price, qty) {
  const total = price * qty
  return total * (1 + TAX_RATE)
}

// A predictable version:
function calculateFinalPrice(price, qty, taxRate) {
  const total = price * qty
  return total * (1 + taxRate)
}
```

- React components are just JavaScript functions. The only thing we need to do is to capitalize the first letter of the function so that React can recognize the Component.
- If a component is reused elsewhere, move it to its own file. Otherwise, check its size: if it’s long, extract it into a separate file; if not, keep it where it is used.