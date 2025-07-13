import * as z from "zod/v4";

const userSchema = z.object({
  username: z.string().min(5),
  age: z.number().min(18),
  posts: z.array(z.object({ title: z.string().min(3) })).nonempty(),
});

console.log(z.toJSONSchema(userSchema), "schema");
/* Output will be:
{
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 5 },
    age: { type: 'number', minimum: 18 },
    posts: { minItems: 1, type: 'array', items: [Object] }
  },
  required: [ 'username', 'age', 'posts' ],
  additionalProperties: false
}
 

*/
