## JEST

AAA pattern, test naming conventions

// objectContaining
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

### Mocks

Mocks replace functions in your code to help you focus on the function you're testing and track all operations on the mocked function. For example, in the `test.ts` file, the mock function's `mock` property lets you access information like which parameters were used or how many times it was called.

**Example:**

```ts
// index.ts
export function sayHi(username: string, callback: (done: boolean) => string) {
  return callback(true);
}

// test.spec.ts
import { sayHi } from "./index";

describe("test sayHi function", () => {
  it("should call cb", () => {
    const cb = jest.fn((done: boolean) =>
      done ? "completed" : "not completed"
    );

    sayHi("username", cb);

    expect(cb).toHaveBeenCalled(); // it is called
    expect(cb.mock.calls.length).toBe(1); // is the length of the calls array 1
    expect(cb.mock.calls[0][0]).toBe(true); // is the first param of the first call true
    expect(cb.mock.results[0].value).toBe("completed"); // is the result of the first call "completed"
    expect(cb.mock.lastCall).toBeDefined(); // is the last call defined
    expect(cb.mock.lastCall![0]).toBe(true); // is the first param of the last call true
  });
});
```

**Mock Return Values:**  
`mockReturnValueOnce`: Sonraki çalıştırma için return edilecek değeri ekler.  
`mockReturnValue`: Sonraki tüm değerler için return değerini belirler.  
Bu sayede mock fonksiyonlarının içini tanımlamadan return değerini belirleyerek çok daha kolay testler yazabiliriz.

```ts
it("mock test", () => {
  const cb = jest.fn();
  cb.mockReturnValueOnce("not completed").mockReturnValue("completed");
  cb();
  cb();
  expect(cb).toHaveBeenCalled(); // it is called
  expect(cb.mock.calls.length).toBe(2); // is the length of the calls array 1
  expect(cb.mock.results[0].value).toBe("not completed"); // is the result of the first call "completed"
  expect(cb.mock.results[1].value).toBe("completed"); // is the result of the second call "completed"
  expect(cb.mock.lastCall).toBeDefined(); // is the last call defined
  expect(cb.mock.lastCall![0]).not.toBeDefined(); // is the first param of the last call true
});
```

**Async Mock Functions:**

- `mockResolvedValueOnce`: Same as `mockReturnValueOnce(Promise.resolve())`. Used to resolve async functions.
- `mockRejectedValueOnce`: Same as `mockReturnValueOnce(Promise.reject())`. Used to reject async functions.
- `mockResolvedValue`: Same as `mockReturnValue(Promise.resolve())`. Sets default resolve value for async functions.
- `mockRejectedValue`: Same as `mockReturnValue(Promise.reject())`. Sets default reject value for async functions.

These functions are used to mock async functions. For example, if we have a function that makes external requests with axios (like in `index.ts`), it's not practical to run these external requests in test environment. So mocking them and defining sample responses is more functional.

```ts
// index.ts
export const getAlbum = async (id: string) => {
  try {
    const response = await axios.get(
      `https://jsonplaceholder.typicode.com/posts/${id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// test.ts
it("test getAlbum", async () => {
  const mockResponse = {
    userId: 1,
    id: 1,
    title:
      "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    body: "hi",
  };

  // we made the first request reject and the second one resolve.
  (axios.get as jest.Mock)
    .mockRejectedValueOnce(new Error("Data Not found"))
    .mockResolvedValueOnce({
      data: mockResponse,
    });
  // this also equivalent to below code
  // (axios.get as jest.Mock)
  //   .mockReturnValueOnce(Promise.reject(new Error("Data Not found")))
  //   .mockReturnValueOnce(Promise.resolve({ data: mockResponse }));

  await expect(getAlbum("hiworld")).rejects.toThrow(Error);
  await expect(getAlbum("1")).resolves.toEqual(mockResponse);
});
```

**Mock Implementations:**
In Jest, we can write mock implementation in `jest.fn(implementation)` itself, and also add implementations with these functions:

- `mockImplementation`: Default mock implementation
- `mockImplementationOnce`: Implementation that works just once

```ts
const myFunction = jest
  .fn()
  .mockImplementation((username: string) => `hi ${username}`)
  .mockImplementationOnce((username: string) => `hello ${username}`);

it("test myFunction", () => {
  expect(myFunction("cibilex")).toBe("hello cibilex"); // first call
  expect(myFunction("cibilex")).toBe("hi cibilex"); // subsequent calls
});
```

**Partial Module Mocking:**
With Jest, we can mock a file partially. For example, if you have multiple functions in a file and want to mock only specific ones while keeping others intact:

Let's assume that we have below file:

```ts
import axios from "axios";

export function getUser(username: string) {
  return { id: 1, username, password: undefined };
}

export const getAlbum = async (id: string) => {
  try {
    const response = await axios.get(
      `https://jsonplaceholder.typicode.com/posts/${id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default function () {
  return "hi world";
}
```

And run below test:

```ts
import * as indexFile from ".";
import indexFile2 from ".";
it("index file", () => {
  console.log("named export", indexFile);
  console.log("default export", indexFile2);
});
/*
  named export {
      getAlbum: [Function: getAlbum],
      getUser: [Function: getUser],
      default: [Function: default_1]
    }

   default export [Function: default_1]
*/
```

As you can see, this import include default and other members inside an object.Let's try to test below scenarious:

1. mock the axios library and check the result correction.
2. mock the `/index` file partially,just mock the getUser and write tests for all functions.

```ts
import axios from "axios";
import defaultfunction, { getAlbum, getUser } from "./index";

jest.mock("axios");
const mockedAxios = jest.mocked(axios);
jest.mock("./index", () => {
  const original = jest.requireActual("./index");

  return {
    __esModule: true,
    ...original,
    getUser: jest
      .fn()
      .mockReturnValue("hi cibilex")
      .mockReturnValueOnce("hello cibilex"),
  };
});

const mockedGetUser = jest.mocked(getUser);
describe("test index file", () => {
  it("test getUser", () => {
    const mockResponse = {
      userId: 1,
      id: 1,
      title:
        "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
      body: "hi",
    };
    mockedAxios.get.mockResolvedValue({
      data: mockResponse,
    });

    return expect(getAlbum("cibilex")).resolves.toEqual(mockResponse);
  });

  it("validate mocks", () => {
    expect(jest.isMockFunction(getUser)).toBe(true);
    expect(jest.isMockFunction(axios.get)).toBe(true);
    expect(jest.isMockFunction(defaultfunction)).toBe(false);
    expect(jest.isMockFunction(getAlbum)).toBe(false);
  });

  it("test getAlbum error", () => {
    mockedAxios.get.mockRejectedValue(new Error("Data Not found"));

    return expect(getAlbum("cibilex")).rejects.toThrow(Error);
  });

  it("test getUser", () => {
    // the first return value is hello cibilex, the second return value is hi cibilex
    expect(getUser("cibilex")).toBe("hello cibilex");
    expect(getUser("cibilex")).toBe("hi cibilex");
    expect(mockedGetUser.mock.calls.length).toBe(2);
    expect(mockedGetUser.mock.calls[0]).toEqual(["cibilex"]);
  });

  it("test defaultfunction", () => {
    expect(defaultfunction()).toBe("hi world");
  });
});
```

- **jest.mock(path,factory,options)** is used to mock a module.
- **jest.mocked(member)**: is used to create a wrapper to get types of package and jest.This wrapper helps us to avoid type castings.
- **jest.isMockFunction(member)**: is used to check whether the member was mocked
- **jest.spyOn(object,methodName):mockedMethod**: is used to create a mock function with [object][methodName] path.  
  **Note**: while value of mocked function created with `mock` is undefined, value of mocked function with `spyOn` is function itself.It's important to know that to do not mistakes.

```ts
import axios from "axios";
import { getAlbum } from ".";

const mockedAxios = jest.spyOn(axios, "get");

describe("test index file", () => {
  it("test getUser", () => {
    const mockResponse = {
      userId: 1,
      id: 1,
      title:
        "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
      body: "hi",
    };

    mockedAxios.mockResolvedValue({ data: mockResponse });
    return expect(getAlbum("cibilex")).resolves.toEqual(mockResponse);
  });
});
```

**mockFn.mockClear**: Clears all data in mock.calls, mock.instances, mock.results, and mock.contexts, but keeps the mock implementation. Useful in beforeEach to reset call history.

**mockFn.mockReset**: A superset of mockClear. Does everything mockClear does and also removes any custom implementation. Useful in beforeEach when you want a clean mock with no behavior.

**mockFn.mockRestore**: A superset of mockReset. Does everything mockReset does and also restores the original function implementation. Only works with jest.spyOn or restorable mocks.

**jest.clearAllMocks**: Does the same as mockClear for every mock in the current test scope.

**resetAllMocks**: Does the same as mockReset for every mock in the current test scope.

**restoreAllMocks**: Does the same as mockRestore for every restorable mock in the current test scope.

```ts
import axios from "axios";

const mockedAxios = jest.spyOn(axios, "get");

describe("test index file", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("test getUser", async () => {
    const mockResponse = {
      userId: 1,
      id: 1,
      title:
        "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
      body: "hi",
    };

    mockedAxios.mockResolvedValue(mockResponse);
    await expect(
      axios.get("https://jsonplaceholder.typicode.com/posts/1")
    ).resolves.toEqual(mockResponse);
    expect(mockedAxios).toHaveBeenCalledTimes(1);
  });

  it("test getUser rejection", async () => {
    mockedAxios.mockRejectedValue(new Error("Data Not found"));
    await expect(
      axios.get("https://jsonplaceholder.typicode.com/posts/1")
    ).rejects.toThrow("Data Not found");
    expect(mockedAxios).toHaveBeenCalledTimes(1);
  });
});
```

## Important Note

Let's create an example with a subtle trick:

```ts
// index.ts
import axios from "axios";

type Album = {
  userId: string;
  id: string;
  title: string;
};

type FormattedAlbum = Omit<Album, "id">;

export const getAlbum = async (id: number): Promise<FormattedAlbum> => {
  try {
    const response = await axios.get<Album>(
      `https://jsonplaceholder.typicode.com/albums/${id}`
    );
    const album = response.data;
    if (!album) throw new Error("Album not found");

    return formatAlbum(album);
  } catch (err) {
    throw new Error("Failed to fetch album");
  }
};

export const formatAlbum = ({ userId, title }: Album): FormattedAlbum => ({
  userId,
  title,
});

// test.ts

import axios from "axios";
import { getAlbum } from "./index";

jest.mock("axios");
const mockedAxios = jest.mocked(axios);

const albumResponse = {
  userId: 1,
  title: "Axios Album",
  id: 1,
};

mockedAxios.get.mockResolvedValueOnce({ data: albumResponse });

jest.mock("./index", () => {
  const originalModule = jest.requireActual("./index");

  return {
    __esModule: true,
    ...originalModule,
    formatAlbum: jest.fn().mockResolvedValue({
      userId: 1,
      title: "Mocked Album",
    }),
  };
});

describe("test getAlbum fn", () => {
  it("should return a formatted album", async () => {
    await expect(getAlbum(1)).resolves.toEqual({
      userId: 1,
      title: "Mocked Album",
    });
  });
});
/*
● test getAlbum fn › should return a formatted album

    expect(received).resolves.toEqual(expected) // deep equality

    - Expected  - 1
    + Received  + 1

      Object {
    -   "title": "Mocked Album",
    +   "title": "Axios Album",
*/
```

Please take a time and think about why this example throws error.

Before the solution,let's memorize our knowladge about js module resolution is working.Let's explain the logic of below function:

```ts
export const getAlbum = async (id: number): Promise<FormattedAlbum> => {
  try {
    const response = await axios.get<Album>(
      `https://jsonplaceholder.typicode.com/albums/${id}`
    );
    const album = response.data;
    if (!album) throw new Error("Album not found");

    return formatAlbum(album);
  } catch (err) {
    throw new Error("Failed to fetch album");
  }
};
```

1. When the code comes to `formatAlbum` line,getAlbum looks the formatAlbum in the its scope
2. It is not defined in the locale scope,therefore It starts to look at the file definitions which are in the same file.
3. It is defined in the file scope,therefore `formatAlbum` is being running !!! Be aware that, The mocked `formatAlbum` function is not running because `runAlbum` function didn't need to the look the imports,It found the `runAlbum` at the second try.If the `formatAlbum` didn't found at the second trial,It would be looked at the import level definitions but it didn't need to do that.As a result file level definition of formatAlbum runned instead of mocked one.

How we can solve this problem:
We can solve this problem with two ways:

1. Using seperate file for formatAlbum.Just put the `formatAlbum` in a seperate file and update the test file like below:

```ts
// format.ts
import { Album, FormattedAlbum } from ".";

export const formatAlbum = ({ userId, title }: Album): FormattedAlbum => ({
  userId,
  title,
});

import axios from "axios";
import { getAlbum } from "./index";

jest.mock("axios");
const mockedAxios = jest.mocked(axios);

const albumResponse = {
  userId: 1,
  title: "Axios Album",
  id: 1,
};

mockedAxios.get.mockResolvedValueOnce({ data: albumResponse });

jest.mock("./format", () => {
  const originalModule = jest.requireActual("./index");

  return {
    __esModule: true,
    ...originalModule,
    formatAlbum: jest.fn().mockResolvedValue({
      userId: 1,
      title: "Mocked Album",
    }),
  };
});

describe("test getAlbum fn", () => {
  it("should return a formatted album", async () => {
    await expect(getAlbum(1)).resolves.toEqual({
      userId: 1,
      title: "Mocked Album",
    });
  });
});
```

The second and recommended way to solve this problem is using `spyOn` method to mock specified item like below.

```ts
// index.ts
import axios from "axios";

export type Album = {
  userId: string;
  id: string;
  title: string;
};

export type FormattedAlbum = Omit<Album, "id">;

export const getAlbum = async (id: number): Promise<FormattedAlbum> => {
  try {
    const response = await axios.get<Album>(
      `https://jsonplaceholder.typicode.com/albums/${id}`
    );
    const album = response.data;
    if (!album) throw new Error("Album not found");

    return formatAlbum(album);
  } catch (err) {
    throw new Error("Failed to fetch album");
  }
};

export const formatAlbum = ({ userId, title }: Album): FormattedAlbum => ({
  userId,
  title,
});

// test.ts
import axios from "axios";

export type Album = {
  userId: string;
  id: string;
  title: string;
};

export type FormattedAlbum = Omit<Album, "id">;

export const getAlbum = async (id: number): Promise<FormattedAlbum> => {
  try {
    const response = await axios.get<Album>(
      `https://jsonplaceholder.typicode.com/albums/${id}`
    );
    const album = response.data;
    if (!album) throw new Error("Album not found");

    return formatAlbum(album);
  } catch (err) {
    throw new Error("Failed to fetch album");
  }
};

export const formatAlbum = ({ userId, title }: Album): FormattedAlbum => ({
  userId,
  title,
});
```

## [jest.doMock(moduleName, factory, options)](https://jestjs.io/docs/jest-object#jestdomockmodulename-factory-options)

- `jest.mock` is hoisting module at the top of the imported file.Therefore a file with `jest.mock` is using globally across the file.Sometimes there could be situations that different tests need different mockings or while a test need to be mock a file but another doesn't.In these scenarious `jest.doMock` is used to make the mock test specified.Do not forget to use `jest.resetModules()` in `beforeEach` listener to avoid side effect of `doMock`.Also be sure that you are importing modules after `doMock` defination.You can use `require` or `await import` to import a module dynamically.

```ts
// index.ts
import axios from "axios";

export const getAlbumTitle = async (id: number): Promise<string> => {
  try {
    const response = await axios.get(
      `https://jsonplaceholder.typicode.com/albums/${id}`
    );

    const album = response.data;
    if (!album) throw new Error("Album not found");
    return album.title;
  } catch (err) {
    throw new Error("Failed to fetch album");
  }
};

// test.ts

describe("test index file", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("getAlbumTitle should return mocked title", async () => {
    jest.doMock("axios", () => ({
      get: jest.fn().mockResolvedValue({ data: { title: "Mocked Album" } }),
    }));

    const { getAlbumTitle } = require("./index");

    await expect(getAlbumTitle(1)).resolves.toBe("Mocked Album");
  });

  it("getAlbumTitle should throw error", async () => {
    jest.doMock("axios", () => ({
      get: jest.fn().mockRejectedValue(new Error("Failed to fetch album")),
    }));
    const { getAlbumTitle } = require("./index");

    await expect(getAlbumTitle(1)).rejects.toThrow("Failed to fetch album");
  });
});
```
