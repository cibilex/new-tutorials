## JEST

 ```bash
 npm i jest ts-jest @types/jest typescript
 ```
package.json > scripts> `test:"jest"`
- `npx `
- jest also allow to write .ts config file : 
```ts
import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
};

export default config;
```
When working with eslint,to avoid the un-def  rule we should below configuration:
 ```ts
 {env:{jest:true}}
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
- create a new test(it) for each test 
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
  it.each([  
    { input: "hi world", expected: "HI WORLD" },
    { input: "cibilex", expected: "CIBILEX" },
    { input: "Kevin Spacy", expected: "KEVIN SPACY" },
  ])("$input should be $expected", ({ input, expected }) => {// $ is used to represent the related field
    const actual = toUppercase(input);
    expect(actual).toBe(expected);
  });
```

```ts
//test.ts
export function getUser() {
  return { username: 'cibilex', password: undefined };
}

// test.spec.ts
import { getUser } from './test';

test('sumTest', () => {
  expect(getUser()).toEqual({ username: 'cibilex' }); // this won't throw error ,we should use .toStrictEqual to make it throw error.

});

```

Yukarıdaki kodta .toEqual parametresinde password olmamasına rağmen hata vermez ve test geçerli olur.Strict modda equality için `.toStrictEqual` kullanılmalı.

Bazı özel durumlarda `.toBeFalsy` ve `.toBeTruthy` daha ayrıntılı testler gerekir.Bunlar için    
toBeNull: sadece null değerini kabul eder.   
toBeUndefined: sadece undefined değerini kabul eder.    
toBeNaN: sadece NAN değerini kabul eder.   

.toBeGreaterThan,.toBeGreaterThanOrEqual,.toBeLessThan,.toBeLessThanOrEqual ve floating değerler için .toBeCloseTo kullanılmalıdır.

.toMatch: regex kullanımını sağlar. "expect('my nickname is cibilex').toMatch(/cibilex/);" testi geçer.    
.toContain: arrayda includes metodunu sağlar.

Note: Exception yakalama durumlarında fonksiyon içerisine alınmalı.yoksa test çalışmaz.
```ts
  expect(() => sum(12, 12)).toThrow();

```
## Asynchronous testing
Yukarıdaki fonksiyonu 3 saniye gecikmeyle cevap verecek şekilde ayarlayalım:
```ts
export async function sum(number1: number, number2: number) {
  await new Promise((res) =>
    setTimeout(() => {
      res(true);
    }, 3000),
  );

  return number1 + number2;
}
```
Böyle bir async fonksiyonunun testi için 3 temel yol vardır.
1. `expect(await sum(21, 21)).not.toBeLessThan(54);` : doğru çalışıp çalışmadığına bakmaksızın sadece return değerine bakar.
2. Catch,resolve durumları için ayrı ayrı testler yazabiliriz.
```ts
test('sum func throws an error', async () => {
  await expect(sum(21, 21)).rejects.toMatch('Something went wrong');
});

test('sum func', async () => {
  await expect(sum(21, 21)).resolves.toBe(42);
});
```
Fonksiyonu return değeri olarak verildiğinde de async olarak çalışır.
```ts
test('sum func throws an error', async () =>expect(sum(21, 21)).rejects.toMatch('Something went wrong'));
```
3. Her iki durumu tek teste sığdırabiliriz.
```ts
test('the fetch fails with an error', async () => {
  try {
    const res = await sum(1, 2);
    expect(res).toBe(3);
  } catch (error) {
    expect(() => {
      throw error;
    }).toThrow();
  }
});
```

Listeners
beforeAll: bir test dosyasında   tüm testlerden bir kere önce çalışır.
beforeEach: bir test dosyasında her test için 1 kere çalışır çalışır.
afterAll: bir test dosyasında tüm testlerden sonra çalışır.
afterEach: bir test dosyasında her testten sonra çalışır.

Testleri gruplayarak listenerları belli testlere uygulamak için describe kullanılabilir.
```ts
import { sum } from './test';
beforeAll(() => console.log('global before all'));
beforeEach(() => console.log('global beforeEach'));
test('the fetch fails with an error', async () => {
  await expect(sum(1, 2)).resolves.toBe(3);
});

describe('test to handle catch', () => {
  afterAll(() => console.log('local after all'));
  test('the fetch fails with an error', async () => {
    await expect(sum(1, 5)).rejects.toMatch();
  });
});

// global before all
// global beforeEach
// global beforeEach
// local after all
```
Async test listenerları return değerine atanabilir veya `done` parametresi ile bitme durumu belirtilebilir.
Bir test dosyasında sadece bir testin çalışması için ilgili test test.only flagı ile çalıştırılabilir.


Mock Functions:
Mock fonksiyonları constructor fonksiyon oluşturarak bu fonksiyonun çağrılma,return değerleri ve inject edilme durumlarını kontrol etmek için kullanılır.
Aşağıdaki örnekte fonksiyonumuza bir callback eklemek için mock functions oluşturalım:
```ts
// test.ts
export function getKey<T extends Record<string, string>, Key extends keyof T>(
  obj: T,
  key: Key,
  cal: (key: T[Key]) => string,
) {
  console.log(obj, key);
  return cal(obj[key]);
}


// test.spec.ts
const cb = jest.fn((key: string) => key);

test('mock Function', () => {
  cb('blue');

  expect(getKey({ color: 'red' }, 'color', cb)).toBe('red');

  // 2. kullanımdaki 1. parametre değerini kontrol eder
  expect(cb.mock.calls[1][0]).toBe('red');

  // instance sayısını kontrol eder
  expect(cb.mock.instances.length).toBe(2);

  // kaç kere kullanıldığını kontrol eder
  expect(cb.mock.calls.length).toBe(2);

  // 2. kullanımındaki return değerini kontrol eder
  expect(cb.mock.results[1].value).toBe('red');
});
```

Yukarıdaki gibi  mock fonksiyonumuzun kaç kere çağrıldığı,çağırılırken aldığı parametreler,dönüş değerleri gibi pek çok özellik üzerinde kontrolumuz olur.


Ayrıca return değerlerini belirleyebiliriz.
```ts
  const mock = jest.fn();
  mock
    .mockReturnValueOnce('first return value')
    .mockReturnValue('will be return value expect first call');

  expect(mock()).toBe('first return value');
```

Bir fonksiyonu mocklamak için fonksiyonu eşitlemeliyiz.
```ts
  // @ts-ignore
  testFile.getKey = jest.fn();
  expect(
    testFile.getKey({ color: 'red' }, 'color', (key: string) => key),
  ).toBeUndefined();
```
Her üyeyi tek tek mocklamak yerine tüm dosyayı mocklamak için `mock()` fonksiyonu kullanılabilir
```ts
  jest.mock('./test');
  expect(
    getKey({ color: 'red' }, 'color', (key: string) => key),
  ).toBeUndefined();
```
Default olarak `.mock` fonksiyonu dosyanın tamamını mocklarken partial şekilde mocklamayı yapabiliriz.
```ts
//test.ts
export function getKey<T extends Record<string, string>, Key extends keyof T>(
  obj: T,
  key: Key,
  cal: (key: T[Key]) => string,
) {
  console.log(obj, key);
  return cal(obj[key]);
}

export function sum(number1: number, number2: number) {
  return number1 + number2;
}

//test.spec.ts
jest.mock('./test', () => {
  const originalModule = jest.requireActual('./test');

  return {
    __esmodule: true,
    ...originalModule,
    sum: () => 'return value of sum function',
  };
});

test('compiling android goes as expected', () => {
  expect(getKey({ color: 'red' }, 'color', (key: string) => key)).toBe('red');

  expect(sum(1, 2)).toBe('return value of sum function');
});
```

Mocklanmış bir fonksiyonu veya mock fonksiyonu oluştururken çalıştırılacak fonksiyonu tanımlamak için        
.mockImplementationOnce: tek seferlik fonksiyon sunar.     
.mockImplementation: spesifik sıralam haricindeki default fonksiyonu sunar.      
      
Ayrıca toHaveBeenCalled,toHaveBeenCalledWith ve toHaveBeenCalledTimes gibi ekstra kullanışlı fonksiyonlarda sunar.
```ts
import { sum, getKey } from './test';
jest.mock('./test');

test('compiling android goes as expected', () => {
  //@ts-ignore
  sum.mockImplementation((num1, num2) => num1 * num2);
  expect(sum(12, 2)).toBe(24);

  const mockFn = jest
    .fn()
    .mockReturnValue(true)
    .mockImplementationOnce((text: string) => `hi ${text}`);

  expect(mockFn('cibilex')).toBe('hi cibilex');
  expect(mockFn('cibilex')).toBe(true);
  expect(mockFn.mock.calls.length).toBe(2);

  // daha önce hiç kullanıldı mı
  expect(mockFn).toHaveBeenCalled();

  // kaç kere çağrıldı
  expect(mockFn).toHaveBeenCalledTimes(2);
  
  // cibilex parametresi ile hiç kullanıldı mı 
  expect(mockFn).toHaveBeenCalledWith('cibilex');
});

```

Çoğu zaman bir fonksiyonu tamamen değiştirmek yerine sadece izlemek veya varolan fonskyionun üzerine işlemler yapılır.
Bunun için `.spyOn(object,property)` kullanılır.
```ts
import * as testFile from './test';
jest.spyOn(testFile, 'sum').mockImplementationOnce((num1, num2) => num1 * num2);

test('compiling android goes as expected', () => {
  expect(testFile.sum(1, 2)).toBe(2);
  expect(testFile.sum(1, 2)).toBe(3);

  expect(testFile.sum).toHaveBeenCalledTimes(2);
});
``` 


Useful packages:
jest-diff: gitlens gibi iki değer arasındaki farklılıkları bularak yazdırır.
