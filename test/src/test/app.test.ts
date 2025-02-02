import { getStringInfo, toUppercase } from "../app/app";

describe("app.ts tests", () => {
  it.each([
    { input: "hi world", expected: "HI WORLD" },
    { input: "cibilex", expected: "CIBILEX" },
    { input: "Kevin Spacy", expected: "KEVIN SPACY" },
  ])("$input should be $expected", ({ input, expected }) => {
    const actual = toUppercase(input);
    expect(actual).toBe(expected);
  });
});
