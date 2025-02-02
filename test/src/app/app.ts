import z from "zod";

const schema = z.string();

const user1 = schema.parse("hi");
const user = schema.parse(12);

console.log(user1, user);
