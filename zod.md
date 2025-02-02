# ZOD
- zod is a typescript-first schema declaration and validation library.
- zod schemas are immutable.For example `schema.extend` will return a new schema instead of mutating the current one.
- **Installation**: 
     -  `npm i zod`
     -  `tsconfig.json`> `compilerOptions.strict:true` 
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
         - `.exclude/.extract()` to create sub-enums
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
- **Others**: `nan (Not a number)` `boolean`

- **Optional Values**: 
     1. **For primitives**: `const schema = z.optional(z.string());`
     2. **For objects**: `z.object({ type: z.nativeEnum(UserTypes).optional(), });`
- **Extending exist schema**: `extend` 
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
`