import { tr } from "zod/locales";
import { z as zV4Mini } from "zod/v4-mini";
const mySchema = z.boolean().parse(true); // 2.12kb
const miniSchema = zV4Mini.boolean().parse(true); // 5.91kb

// our bundle size reduced  64% .This seems amazing but when we the main zod librariy build cost is around 5-10kb to our bundle size.
// So To reduce 5-10kb to 3-8kb is not a big deal especially for the backend applications.So I guess I will not use this library and also not recommended you to use it.
// With this library there are some use cases to be careful but I will not cover them here.You can click [here](https://zod.dev/packages/mini) to read more about it.
