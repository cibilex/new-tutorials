### Preventing stacked geolocation callbacks (ref lock pattern)

- **Problem**: Repeated clicks on a confirm button before geolocation resolves stack multiple requests, so `positionSuccessCb` fires N times after permission is granted.
- **Root cause**: Guarding only the mutation (e.g., `isPending`) does not prevent repeated `navigator.geolocation.getCurrentPosition` calls.
- **Fix (simple and reliable)**:
  - **Ref lock**: Use a ref flag to block re-entry while the browser is fetching location.
  - **Set lock** before requesting; **clear** it in both success and error callbacks.
  - **Disable UI** while waiting by wiring the lock to the dialog's `loading` prop.

```tsx
// Pattern (TypeScript / React)
const isRequestingLocationRef = useRef(false);

const handleConfirm = () => {
  if (isPending || isRequestingLocationRef.current) return;
  if (!("navigator" in window) || !("geolocation" in navigator)) {
    enqueueSnackbar("Browser does not support geolocation.", { variant: "info" });
    return;
  }
  isRequestingLocationRef.current = true;
  navigator.geolocation.getCurrentPosition(positionSuccessCb, positionErrorCb);
};

const positionSuccessCb = async ({ coords }: GeolocationPosition) => {
  isRequestingLocationRef.current = false;
  const { latitude, longitude } = coords;
  if (!latitude || !longitude) {
    enqueueSnackbar(t(`GeolocationPositionError.1`), { variant: "error" });
    return;
  }
  await mutateAsync({ latitude, longitude });
};

const positionErrorCb = ({ code }: { code?: number; message: string }) => {
  isRequestingLocationRef.current = false;
  enqueueSnackbar(t(`GeolocationPositionError.${code ? code.toString() : "1"}`), { variant: "error" });
};

// In dialog
<CommonAlert loading={isPending || isRequestingLocationRef.current} ... />
```

- **Applied in code**:
  - `src/pages/WelcomeTeam/components/StartShift/index.tsx`
  - `src/pages/WelcomeTeam/components/CompleteShift/index.tsx`

Short version: one click, one request. The browser is slow; our lock is faster.
