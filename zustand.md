- [redux-like-patterns](https://zustand.docs.pmnd.rs/guides/flux-inspired-practice#redux-like-patterns)

# Zustand
- Zustand state is `immutable`. We cannot change the state directly; we must replace the state.
- The computed selector will cause a rerender if the output has changed according to `Object.is`.
- The `set` function merges the current state with the given state. However, this behavior is only for top-level properties. For example, if our state is:
```ts
export const useUserData = create<State & Actions>((set) => ({
  username: "",
  password: "",
  setUsername: (username) => {
    set({ username }); // set will merge state.
  },
  setPassword: (password) => {
    set({ password }); // set will merge state
  },
}));
```
- For nested objects, we need to explicitly use the spread operator or a third-party library like Immer to protect existing data.
```ts
export const useUserData = create<State & Actions>((set) => ({
  formData: {
    username: "",
    password: "",
  },
  setUsername: (username) => {
    set((state) => ({ formData: { ...state.formData, username } }));
  },
  setPassword: (password) => {
    set((state) => ({ formData: { ...state.formData, password } }));
  },
}));
```
- The second parameter of the `set` function takes a `replace` option. If we set this parameter to `true`, it will `replace` the state entirely (including functions).
- **Colocating the store**: It's recommended to colocate state and actions in the same place. We can use the store.setState function to update the state as shown below:
```ts
  const setUsername = (username: string) => useUserData.setState({ username });
```
- There are no  downsides to this approach, but using a self-contained store is generally better for readability and maintainability of the code.
- **Auto genereting selectors**: It could be tedious to get a member from a store.To make this easier.We can use a wrapper.
1. For **create**:
     - ```ts
        type WithSelectors<S> = S extends { getState: () => infer T }
        ? S & { use: { [K in keyof T]: () => T[K] } }
        : never;

        const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
        _store: S
        ) => {
        let store = _store as WithSelectors<typeof _store>;
        store.use = {};
        for (let k of Object.keys(store.getState())) {
            (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
        }

            return store;
            };

            type State = {
            username: string;
            password: string;
            };

            export const useUserData = createSelectors(
            create<State>(() => ({
                username: "",
                password: "",
            }))
            );
        ``` 
     -  Then we can use members like such as `const username = useUserData.use.username();`
2. For **createStore**: 
     - ```ts
        type WithSelectors<S> = S extends { getState: () => infer T }
        ? S & { use: { [K in keyof T]: () => T[K] } }
        : never;

        const createSelectors = <S extends StoreApi<object>>(_store: S) => {
        const store = _store as WithSelectors<typeof _store>;
        store.use = {};
        for (const k of Object.keys(store.getState())) {
            (store.use as any)[k] = () =>
            useStore(_store, (s) => s[k as keyof typeof s]);
        }

        return store;
        };
        type State = {
        username: string;
        password: string;
        }; 
       ```
- **Reset store**: There is no built-in reset strategy but we can add it like below:
```ts
type State = {
  username: string;
  password: string;
};
type Actions = {
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  reset: () => void;
};
const initialState: State = {
  username: "",
  password: "",
};

export const useUserData = create<State & Actions>((set) => ({
  ...initialState,
  setUsername: (username) => {
    set({ username }); // set will merge state.
  },
  setPassword: (password) => {
    set({ password }); // set will merge state
  },
  reset: () => {
    set(initialState);
  },
}));

// const reset = useUserData((state) => state.reset);
```

- **useShallow**:Zustand rerenders components when the related field in the state is updated, but it re-runs all the listeners (e.g., useStore functions) on each trigger. Therefore, we should be careful in situations like the following:
```ts
const useMeals = create(() => ({
  papaBear: 'large porridge-pot',
  mamaBear: 'middle-size porridge pot',
  littleBear: 'A little, small, wee pot',
}))

export const BearNames = () => {
  const names = useMeals((state) => Object.keys(state))

  return <div>{names.join(', ')}</div>
}
```
- In this case, Zustand will re-render BearNames on every state update, even if the return value of useMeals((state) => Object.keys(state)) hasn't changed. Why? Actually, the values returned by the selector function are not considered the same by Zustand. Zustand uses Object.is to check for equality, which treats arrays as different objects on every render. Therefore, the returned value from Object.keys(state) is always a new array, even if the contents are identical.
- To avoid unnecessary re-renders in such situations, we can use `useShallow`: `const names = useMeals(useShallow((state) => Object.keys(state)))` . With useShallow, Zustand will perform a shallow comparison and only trigger a re-render if the contents of the array (i.e., the keys) have changed,