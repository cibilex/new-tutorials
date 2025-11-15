You can assign any value to both any and unknown. any opts out of type-checking altogether, while unknown requires you to narrow the type before use.

# 🧠 TypeScript Tip: Making Field-Based Change Logs Type-Safe with Discriminated Unions

When building a change log or audit system that tracks field-level changes (e.g. `"name"` changed from `"John"` to `"Jane"`), it’s important to model the types in a way that TypeScript can understand and narrow correctly — especially when the type of each field is different.
asd

---

## 👎 Problem: Generic Field Change with No Narrowing

Let's say we have a simple `User` type:

```ts
type User = {
  name: string;
  age: number;
};

type FieldChange<K> = {
  field: K;
  from: User[K];
  to: User[K];
};

type ChangeLogEntry = FieldChange<keyof User>;
```

But this won’t work the way you expect:

```ts
function printChange(entry: ChangeLogEntry) {
  if (entry.field === "name") {
    entry.from.toUpperCase(); // ❌ TypeScript error: 'from' is still string | number
  }
}
```

Why? Because FieldChange<keyof User> is a single type, not a union of types per field — TypeScript can't narrow it based on the field value.

✅ Solution: Discriminated Union with Mapped Types

```ts
type ChangeLogEntry = {
  [K in keyof User]: {
    field: K;
    from: User[K];
    to: User[K];
  };
}[keyof User];
```

This expands to:

```ts
type ChangeLogEntry =
  | { field: "name"; from: string; to: string }
  | { field: "age"; from: number; to: number };
```

✅ Example in Action

```ts
function printChange(entry: ChangeLogEntry) {
  if (entry.field === "name") {
    // ✅ from is inferred as string
    console.log("Name changed from", entry.from.toUpperCase());
  }

  if (entry.field === "age") {
    // ✅ from is inferred as number
    console.log("Age changed from", entry.from + 1);
  }
}
```
