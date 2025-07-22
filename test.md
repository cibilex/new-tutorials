## JEST

Notes:

- If you have a test that often fails when it's run as part of a larger suite, but doesn't fail when you run it alone, it's a good bet that something from a different test is interfering with this one. You can often fix this by clearing some shared state with beforeEach

```bash
npm i jest ts-jest @types/jest typescript
```

package.json > scripts> `test:"jest"`

- `npx ts-jest config:init` : this command will create an jest.config.ts file
- jest also allow to write .ts config file :

```ts
// jest.config.ts
import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  verbose: true,
  testMatch: ["/**/*test.ts"], // run all files ending with test.ts
  transform: {
    ...tsJestTransformCfg,
  },
};
```

When working with eslint,to avoid the un-def rule we should add below configuration:

```ts
{
  env: {
    jest: true;
  }
}
```

```ts
export const toUppercase = (text: string) => text.toUpperCase(); //app.ts

describe("app.ts tests", () => {
  test("should return uppercase", () => {
    const result = toUppercase("hi world");
    expect(result).toBe("HI WORLD");
  });
});

// Here is a better version
describe("app.ts tests", () => {
  it("should return uppercase", () => {
    // arrange
    const sut = toUppercase;
    const expected = "ABC";

    // act
    const actual = sut("abc");

    // expect
    expect(actual).toBe(expected);
  });
});
```

- `it` is alias for `test`
- We should use `.toEqual` instead of `.toBe` for non-primitive values because `.toBe` uses `Object.is` method, so `.toBe({},{})` will throw error.

```ts
export const getStringInfo = (text: string) => {
  return {
    length: text.length,
    array: text.split(""),
    uppercase: text.toUpperCase(),
    lowercase: text.toLowerCase(),
  };
};

it("should be a valid function", () => {
  const actual = getStringInfo("hi world");

  expect(actual.array).toContain<string>("h");
  expect(actual.length).toBe(8);
  expect(actual.array).toHaveLength(8);
  expect(actual.uppercase).toBe("HI WORLD");
  expect(actual.array).toEqual(["h", "i", " ", "w", "o", "r", "l", "d"]);
  expect(actual.lowercase).not.toBe(undefined);
  expect(actual.lowercase).not.toBeUndefined();
  expect(actual.lowercase).toBeDefined();
  expect(actual.lowercase).toBeTruthy();
});
```

```ts
//test.ts
export function getUser() {
  return { username: "cibilex", password: undefined };
}

// test.spec.ts
import { getUser } from "./test";

test("sumTest", () => {
  expect(getUser()).toEqual({ username: "cibilex" }); // this won't throw error ,we should use .toStrictEqual to make it throw error.
});
```

In the above code will not throw error since `.toEqual` do not validate the result strictly,To enable strict validation we can use `.toStrictEqual`.

Bazı özel durumlarda `.toBeFalsy` ve `.toBeTruthy` daha ayrıntılı testler gerekir.Bunlar için  
toBeNull: sadece null değerini kabul eder.  
toBeUndefined: sadece undefined değerini kabul eder.  
toBeNaN: sadece NAN değerini kabul eder.

.toBeGreaterThan,.toBeGreaterThanOrEqual,.toBeLessThan,.toBeLessThanOrEqual ve floating değerler için .toBeCloseTo kullanılmalıdır.

.toMatch: regex kullanımını sağlar. "expect('my nickname is cibilex').toMatch(/cibilex/);" testi geçer.  
.toContain: arrayda includes metodunu sağlar.

- **each**: Creates a loop for each item of given array.It can be used both describe and it. `describe.each(table)(name, fn)`

```ts
it.each([
  { input: "hi world", expected: "HI WORLD" },
  { input: "cibilex", expected: "CIBILEX" },
  { input: "Kevin Spacy", expected: "KEVIN SPACY" },
])("$input should be $expected", ({ input, expected }) => {
  // $ is used to represent the related field
  const actual = toUppercase(input);
  expect(actual).toBe(expected);
});
```

- **only**: Jest will run just only selected test or describe.. `describe.only(name, fn)`
- **skip**: We can write `skip` flag to skip a particular test or describe. `describe.skip(name,fn)`
- In Jest, assertions must be placed inside a test/it block. For example, writing expect(true).toBe(true) outside a test will throw an error.
- As a convention, each test/it should ideally include only one assertion, to keep tests focused and easier to debug.
- describe is used to group related tests under a common topic.

```ts
export const getUser = async (name: string): Promise<{ username: string }> => {
  await new Promise((res) => {
    setTimeout(() => res(true), 550);
  });
  if (name === "cibilex") {
    throw new Error("User not found");
  }
  return { username: name };
};

describe("getUser function", () => {
  test("should throw not found error", () => {
    return expect(getUser("cibilex")).rejects.toThrow("User not found");
  });

  test("should return user", () => {
    return expect(getUser("alex")).resolves.toEqual({ username: "alex" });
  });
});
```

## Asynchronous testing

Yukarıdaki fonksiyonu 3 saniye gecikmeyle cevap verecek şekilde ayarlayalım:

```ts
export async function sum(number1: number, number2: number) {
  await new Promise((res) =>
    setTimeout(() => {
      res(true);
    }, 3000)
  );

  return number1 + number2;
}
```

Böyle bir async fonksiyonunun testi için 3 temel yol vardır.

```ts
export const getUser = async (name: string): Promise<{ username: string }> => {
  await new Promise((res) => {
    setTimeout(() => res(true), 500);
  });
  if (name === "cibilex") {
    throw new Error("User not found");
  }

  return { username: name };
};
```

1.We can achieve `then/catch` logic in Jest tests using the `.resolves` and `.rejects` matchers like below:

```ts
it("get cibilex", async () => {
  await expect(getUser("cibilex")).rejects.toThrow("User not found");
});

it("get alex", async () => {
  await expect(getUser("alex")).resolves.toEqual({ username: "alex" });
});
```

In Jest, if we return the assertion, Jest treats the test as async function and waits for the promise to settle. So, we can rewrite the above code like this:

```ts
it("get cibilex", () => {
  return expect(getUser("cibilex")).rejects.toThrow("User not found");
});

it("get alex", () => {
  return expect(getUser("alex")).resolves.toEqual({ username: "alex" });
});
```

🔥 Important: If you forget to return or await the assertion, Jest will complete the test before the async operation finishes — causing false positives or missed failures.

2. Also we can write async tests with `try/catch` logic.

```ts
it.each([{ name: "cibilex" }, { name: "alex" }])(
  "get $name",
  async ({ name }) => {
    try {
      const act = await getUser(name);
      expect(act).toEqual({ username: name });
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toMatch("User not found");
    }
  }
);
```

Listeners:  
`beforeAll`: bir test dosyasında tüm testlerden bir kere önce çalışır.  
`beforeEach`: bir test dosyasında her test için 1 kere çalışır çalışır.  
`afterAll`: bir test dosyasında tüm testlerden sonra çalışır.  
`afterEach`: bir test dosyasında her testten sonra çalışır.

- By default jest will not wait for async functions inside listeners and run the tests.To make the listeners logic async,we can return the async function or use `done` method.

```ts
beforeEach(() => {
  return initDb();
});
```

Testleri gruplayarak listenerları belli testlere uygulamak için describe kullanılabilir.

```ts
import { sum } from "./test";
beforeAll(() => console.log("global before all"));
beforeEach(() => console.log("global beforeEach"));
afterAll(() => console.log("global after all"));

test("the fetch fails with an error", async () => {
  await expect(sum(1, 2)).resolves.toBe(3);
});

describe("test to handle catch", () => {
  afterAll(() => console.log("local after all"));
  test("the fetch fails with an error", async () => {
    await expect(sum(1, 5)).rejects.toMatch();
  });
});

// global before all
// global beforeEach
// global beforeEach
// local after all
// global after all
```

- **Test Doubles**:

1. **Fakes**: They are similates the real object or functions.

```ts
export const sumNumbers = (
  num1: number,
  num2: number,
  logger: (message: string) => void
) => {
  const result = num1 + num2;
  logger(`result of ${num1} + ${num2} is ${result} `);
  return result;
};

it.only("test 2 + 5", () => {
  const act = sumNumbers(2, 5, () => {}); // ()=>{} is fake
  expect(act).toBe(7);
});
```

In the above example,we just write an fake function to run our test.However we don't know how much our function run,what the argument is called with our logger etc...,we can do something like below to track our logger.

```ts
let timesCalled = 0;
let calledArg: string;

it.only("test 2 + 5", () => {
  const logger = (arg: string) => {
    calledArg = arg;
    timesCalled++;
  };
  const act = sumNumbers(2, 5, logger);
  expect(act).toBe(7);
  expect(calledArg).toBe("result of 2 + 5 is 7 ");
  expect(timesCalled).toBe(1);
});
```

but this is not enough because our function can be more complex and also this is exhuasting.To solve this problem,we can use `mocks` 2. **Mocks**: Mocks help us to track our fake functions like below example.

```ts
it.only("test 2 + 5", () => {
  const logger = jest.fn();
  const act = sumNumbers(2, 5, logger);
  expect(act).toBe(7);
  expect(logger).toHaveBeenCalledWith("result of 2 + 5 is 7 ");
  expect(logger).toHaveBeenCalledTimes(1);
});
```

As you can see,it both simpler and useful.

Mock Functions:
Mock fonksiyonları constructor fonksiyon oluşturarak bu fonksiyonun çağrılma,return değerleri ve inject edilme durumlarını kontrol etmek için kullanılır.
Aşağıdaki örnekte fonksiyonumuza bir callback eklemek için mock functions oluşturalım:

```ts
// test.ts
export function getKey<T extends Record<string, string>, Key extends keyof T>(
  obj: T,
  key: Key,
  cal: (key: T[Key]) => string
) {
  console.log(obj, key);
  return cal(obj[key]);
}

// test.spec.ts
const cb = jest.fn((key: string) => key);

test("mock Function", () => {
  cb("blue");

  expect(getKey({ color: "red" }, "color", cb)).toBe("red");

  // 2. kullanımdaki 1. parametre değerini kontrol eder
  expect(cb.mock.calls[1][0]).toBe("red");

  // instance sayısını kontrol eder
  expect(cb.mock.instances.length).toBe(2);

  // kaç kere kullanıldığını kontrol eder
  expect(cb.mock.calls.length).toBe(2);

  // 2. kullanımındaki return değerini kontrol eder
  expect(cb.mock.results[1].value).toBe("red");
});
```

Yukarıdaki gibi mock fonksiyonumuzun kaç kere çağrıldığı,çağırılırken aldığı parametreler,dönüş değerleri gibi pek çok özellik üzerinde kontrolumuz olur.

Ayrıca return değerlerini belirleyebiliriz.

```ts
const mock = jest.fn();
mock
  .mockReturnValueOnce("first return value")
  .mockReturnValue("will be return value expect first call");

expect(mock()).toBe("first return value");
```

Bir fonksiyonu mocklamak için fonksiyonu eşitlemeliyiz.

```ts
// @ts-ignore
testFile.getKey = jest.fn();
expect(
  testFile.getKey({ color: "red" }, "color", (key: string) => key)
).toBeUndefined();
```

Her üyeyi tek tek mocklamak yerine tüm dosyayı mocklamak için `mock()` fonksiyonu kullanılabilir

```ts
jest.mock("./test");
expect(getKey({ color: "red" }, "color", (key: string) => key)).toBeUndefined();
```

Default olarak `.mock` fonksiyonu dosyanın tamamını mocklarken partial şekilde mocklamayı yapabiliriz.

```ts
//test.ts
export function getKey<T extends Record<string, string>, Key extends keyof T>(
  obj: T,
  key: Key,
  cal: (key: T[Key]) => string
) {
  console.log(obj, key);
  return cal(obj[key]);
}

export function sum(number1: number, number2: number) {
  return number1 + number2;
}

//test.spec.ts
jest.mock("./test", () => {
  const originalModule = jest.requireActual("./test");

  return {
    __esmodule: true,
    ...originalModule,
    sum: () => "return value of sum function",
  };
});

test("compiling android goes as expected", () => {
  expect(getKey({ color: "red" }, "color", (key: string) => key)).toBe("red");

  expect(sum(1, 2)).toBe("return value of sum function");
});
```

Mocklanmış bir fonksiyonu veya mock fonksiyonu oluştururken çalıştırılacak fonksiyonu tanımlamak için  
.mockImplementationOnce: tek seferlik fonksiyon sunar.  
.mockImplementation: spesifik sıralam haricindeki default fonksiyonu sunar.

Ayrıca toHaveBeenCalled,toHaveBeenCalledWith ve toHaveBeenCalledTimes gibi ekstra kullanışlı fonksiyonlarda sunar.

```ts
import { sum, getKey } from "./test";
jest.mock("./test");

test("compiling android goes as expected", () => {
  //@ts-ignore
  sum.mockImplementation((num1, num2) => num1 * num2);
  expect(sum(12, 2)).toBe(24);

  const mockFn = jest
    .fn()
    .mockReturnValue(true)
    .mockImplementationOnce((text: string) => `hi ${text}`);

  expect(mockFn("cibilex")).toBe("hi cibilex");
  expect(mockFn("cibilex")).toBe(true);
  expect(mockFn.mock.calls.length).toBe(2);

  // daha önce hiç kullanıldı mı
  expect(mockFn).toHaveBeenCalled();

  // kaç kere çağrıldı
  expect(mockFn).toHaveBeenCalledTimes(2);

  // cibilex parametresi ile hiç kullanıldı mı
  expect(mockFn).toHaveBeenCalledWith("cibilex");
});
```

Çoğu zaman bir fonksiyonu tamamen değiştirmek yerine sadece izlemek veya varolan fonskyionun üzerine işlemler yapılır.
Bunun için `.spyOn(object,property)` kullanılır.

```ts
import * as testFile from "./test";
jest.spyOn(testFile, "sum").mockImplementationOnce((num1, num2) => num1 * num2);

test("compiling android goes as expected", () => {
  expect(testFile.sum(1, 2)).toBe(2);
  expect(testFile.sum(1, 2)).toBe(3);

  expect(testFile.sum).toHaveBeenCalledTimes(2);
});
```

Useful packages:
jest-diff: gitlens gibi iki değer arasındaki farklılıkları bularak yazdırır.
