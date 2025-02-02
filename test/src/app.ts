import z, { date } from "zod";
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

console.log(user.data, user?.error?.errors, "user");
console.log(user2.data, user2?.error?.errors, "user2");
