# ZOD
- Zod is a great way to parse and validate data in primarly TypeScript, but it can be used in JavaScript also.Zod schemas are immutable,Because of this pattern `z.extend` or other methods always returns a new schema instead of modifying the current one.
- **Installation**: 
     -  `npm i zod`
     -  `tsconfig.json`> `compilerOptions.strict:true` : This option is recommended to get a better experience.

We have two way to parse data,the farmer is `parse` and the latter is `safeParse`.Let's make some basic examples.
```ts
import z from "zod";
const schema = z.string();

const user1 = schema.parse("hi"); // "hi"
const user2 = schema.parse(12); //throws zodError

const user3 = schema.safeParse("hi"); // {success:true,data:"hi"}
const user4 = schema.safeParse(12); // {success:false,error:[Getter]}
```

```ts
import z from "zod";
const User = z.object({
  username: z.string(),
});

const user = User.safeParse({ username: "hi world" }); // {success:true,data:{username:"hi world"}}
const user = User.safeParse({ username: 123 }); // {success:false,error:[Getter]}
```

- **Type Coercion**:  zod uses javascript built-in functions such as `Boolean,String,Number` for coercion. So It might seem a bit tricky to us.For example :
```ts
import z from "zod";
const User = z.object({
  username: z.coerce.string(),
  isAdmin: z.coerce.boolean(),
});

const user = User.safeParse({
  username: undefined, // "undefined" Also null=> `null` , 0=>"0", true => "true" ,false =>"false"
  isAdmin: 0, // false  Also 1=> true , "hi world" => true , [] => true ,undefined => false
});
```
- **Strings**:
     - validations:  `min` `max` `length (exactly char length)`  `email` `url` `includes` `startsWith` `endsWidth` 
     - transformers: `trim` `toUpperCase` `toLowerCase` : Order of functions are important! for example:
          - `username: z.coerce.string().length(5).trim()` => "hiwor  " will throw error
          -  `username: z.coerce.string().trim().length(5)` => "hiwor  " => ok
     - dates: `date (YYYY-MM-DD)` `time (HH:mm:ss)` `datetime (YYY-MM-DDTHH:mm:ssZ)`  :
          - `date: z.string().date()` => `new Date` => will throw error , `2023-12-12` => ok 
          - `date: z.coerce.string().time()` => `new Date()`=> will throw error, `"12:10:05"` => ok
          - `date: z.coerce.string().datetime()` => `new Date()` => will throw error, `"2025-01-15T12:10:05Z"` =>ok ,`new Date().toISOString()` =>ok ,`2020-01-01T00:00:00+02:00` => fail: no offset allowed.
- **Numbers**: `gt` `gte` `lt` `lte` `positive (>0)` `negative (<0)` `nonpositive(<=0)` `nonnegative (>=0)` `int` `multipleOf`
- **Dates**: `date`
     - `date: z.date()` => `new Date()` => ok , `2025-02-02T09:43:36.803Z` => will throw error (`coerce` should be used)
     - `date: z.date().max(new Date("2025-01-10"))` => new Date() (2025-01-30) => will throw error
- **enums**: 
     1. **enum**: It's zod-native way to declare enums.
         - `type: z.enum(["user", "admin", "superadmin"])` => "hi" => will throw errors , `"admin"` =>ok 
         - Also can be declared with pre-defined values `["Salmon", "Tuna", "Trout"] as const`
     2. **native enums**: TS enums can be used directly.
         - ```ts
            enum UserTypes {
            USER = "user",
            ADMIN = "admin",
            OTHERS = 99,
            }
            const User = z.object({
            type: z.nativeEnum(UserTypes),
            });

            const user = User.safeParse({
            type: UserTypes.ADMIN,  // ok  , `admin` => ok , `hi` => will throw error
            }); 
           ``` 
- **Boolean**: This part is a bit tricky.Zod just allow `true` and `false` values for `z.boolean()`. We can use `z.coerce.boolean()` to make the zod consider falsy values like `0` `null` `false` `undefined` `""` as  `false` and all of the other values such as `"hi world"` `true` `231` `[]` as true.But this approach is still not enough  use  case for env-variables or query parameters.To accomplish this issue zod intruduced a new feature called `z.stringbool()` that works like below.This feature is existed in the zod@4.
```ts
const strbool = z.stringbool();
 
strbool.parse("true")         // => true
strbool.parse("1")            // => true
strbool.parse("yes")          // => true
strbool.parse("on")           // => true
strbool.parse("y")            // => true
strbool.parse("enable")       // => true
 
strbool.parse("false");       // => false
strbool.parse("0");           // => false
strbool.parse("no");          // => false
strbool.parse("off");         // => false
strbool.parse("n");           // => false
strbool.parse("disabled");    // => false
 
strbool.parse(/* anything else */); // ZodError<[{ code: "invalid_value" }]>
```
- **Others**: `nan (Not a number)` `nullable`


- **Arrays**: `array` can be used to declare an array.Array item can be direcly declared into the `array()` method.
```ts
const users = z.array(z.string());
type Users = z.infer<typeof users>; // string[]

const users2 = z.array(z.string()).optional();
type Users2 = z.infer<typeof users2>; // string[] | undefined

const user3 = z.array(z.string().optional());
type User3 = z.infer<typeof user3>; // (string | undefined)[]

const user4 = z.array(z.string()).nonempty(); // should includes at least 1 element

const user5 = z.array(z.string()).min(4).max(10); // should includes at least 4 and at most 10 elements
```
Note: `tuple` can be used to declare tuple type.
- **transform**:To transform data after parsing, use the transform method. `const stringToNumber = z.string().transform((val) => val.length);`
- **Optional Values**: 
     1. **For primitives**: `const schema = z.optional(z.string());`
     2. **For objects**: `z.object({ type: z.nativeEnum(UserTypes).optional(), });`
- **Extending exist schema**: Existing schemas can be extended with `extend method`. 
     - ```ts
        enum UserTypes {
        USER = "user",
        ADMIN = "admin",
        OTHERS = 99,
        }
        const schema = z.object({
        type: z.nativeEnum(UserTypes).optional(),
        });
        const newSchema = schema.extend({
        age: z.number().int().positive(),
        });

        const user = schema.safeParse({
        type: UserTypes.ADMIN, // ok
        });
        const user2 = newSchema.safeParse({
        type: UserTypes.ADMIN, //will throws error
        }); 
       ```
- **Accessing schema keys**: `shape` key can be used to access particular schema in a existing schema.
```ts
const userSchema = z.object({
  name: z.string().min(4),
  isAdmin: z.coerce.boolean(),
});

const nameSchema = userSchema.shape.name;

const nameRes = nameSchema.safeParse("hiworld"); // { success: true, data: 'hiworld' }
console.log(nameRes);
```
- **Pick/Omit schema**: `pick` and `omit` functions can be used as the logic of TypeScript `Pick` and `Omit`.
```ts

const userSchema = z.object({
  name: z.string().min(4),
  isAdmin: z.coerce.boolean(),
});

const updateUserSchema = userSchema.omit({ isAdmin: true });
const updateUserRes = updateUserSchema.safeParse({ name: "hi world" }); // { success: true, data: { name: 'hi world' } }
```
- **Strict Schemas**: By default Zod won't throw any error if unrecognized key cames into the schema but remove it from the result.To throw error if unrecognized key comes,`strict` can be used.
```ts
const userSchema = z.object({
  name: z.string().min(4),
  isAdmin: z.coerce.boolean(),
});

const strictUserSchema = userSchema.strict();
const data = {
  name: "hi world",
  isAdmin: true,
  key2: "hi",
};
const userRes = userSchema.safeParse(data); // { success: true, data: { name: 'hi world', isAdmin: true } }
const strictUserRes = strictUserSchema.safeParse(data); // { success: false, error: [Getter] }
```
- **partial,deepPartial,required**: 
   1. Inspired by the built-in TypeScript utility type Partial, the .partial method makes all properties optional.
   2. The .partial method is shallow — it only applies one level deep. There is also a "deep" version.
   3. Contrary to the .partial method, the .required method makes all properties required.

- **refine(refine(validator: (data:T)=>any, params?: RefineParams))**: `refine` method used to add custom logic to a schema.Refinement functions should not throw. Instead they should return a falsy value to signal failure.First argument is the validation function and the second one is for refine params.For example if we want to validate password confirmation,below schema will works correctly.
```ts
const passwordSchema = z
  .object({
    password: z.string().min(4).max(10),
    confirm: z.string().min(4).max(10),
  })
  .refine((data) => data.confirm === data.password, {
    path: ["confirm"],
    message: "Password and confirm password do not match.",
  });

const passwordRes = passwordSchema.safeParse({ // { success: false, error: [Getter] }
  password: "hiworld123",
  confirm: "hiworld12",
});
```
The second parameter also can be custom function and returns `RefineParams` like below.
```ts
const passwordSchema = z
  .object({
    password: z.string().min(4).max(10),
    confirm: z.string().min(4).max(10),
  })
  .refine(
    (data) => data.confirm === data.password,
    (data) => ({
      path: ["confirm"],
      message: `Password(${data.password}) and confirm(${data.confirm}) password do not match.`,
    })
  );

const passwordRes = passwordSchema.safeParse({ // error message is: Password(hiworld123) and confirm(hiworld12) password do not match.
  password: "hiworld123",
  confirm: "hiworld12",
});
```
- **superRefine**: `superRefine` is used for complex used cases.For example if we need to add custom validations not just once,but 4 different custom validation.The `superRefine` will be better suitable.
```ts
const driverStatusFormSchema = z
    .object({
        dateRange: z.tuple([
            z.custom<DateTime | null>((val) => val !== null && val instanceof DateTime, {
                message: "startTime cannot be null and must be a valid date",
            }),
            z.custom<DateTime | null>(),
        ]),
    })
    .superRefine((data, ctx) => {
        const [startTime, endTime] = data.dateRange;
        if (startTime && !startTime.hasSame(DateTime.local(), "day") && !endTime) {
            ctx.addIssue({
                path: ["dateRange"],
                message: "endTime cannot be null unless startTime is today's date",
                code: z.ZodIssueCode.custom,
            });
        }
    });
```