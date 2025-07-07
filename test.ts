import * as z from "zod/v4-mini";

const userName = z.string();

console.log(userName.safeParse("hisad"));
