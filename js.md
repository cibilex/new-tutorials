Js engine: Js kodu doğrudan çalışmaz,Bir js engine ile human-readable code machine readable hale gelir ve öyle çalışır.  
Node,google chrome> v8 engine  
Safari>Javascript core webkit  
mozilla firefox> spider monkey

JIT(just-in-time):MOdern engineler js kodunu JIT yöntemi ile çalıştırır.Kodun daha hızlı çalışabilmesi için compile edilen kodun optimizasyonu runtimeda olur.  
 Yani performanslı olmayan bir derleme oldu>kod çalıştı>kod çalışırken derlenen kod optimizasyonu olur.Bu işlemlere JIT denir yani olabildiğince çabuk kodu çalıştırma.

değeri fonksiyon olan değişkenlerin initial değeri undefined,ardından js fonku çalıştırarak değer ataması yapar.

bir fonksiyon çalıştırırken local ortamına this diğer adıyla execution context denir.Fonksiyon bittiğinde return değerinin adresi değil değeri döner ve execution context garbage collector tarafından silinir.

js default olarak network işlemleri yapamaz,fetch third party bir pakettir.

Promiselerın then(fulfillment) ve catch arraylari microtask queue atanır.Callback queue değil.

Tarayıcının kendi tercihine kalmıştır microtask queue mu yoksa callback queue mu çalıştırmak.Genelde microtask queue önce çalıştırılır.

arrow fonksiyonun kendi execution contexti olmaz ve parent execution contexti içerisinde çalışır.

closure :a closure allow us to access outer function scope in a inner function.

heap : storage of all the variables  
microtask queue  
callback queue  
browser  
lexical scope

**generator functions**:are used to access execution context and yield multiple result from a function via multiple calls.

- **yield** is used to yield a value,yield point will be the starter point for the next call. `yield expression` runs asynchoronously.
- **yield\*** is used to delegate a new generator function.

```js
function* func1() {
  yield "a";
  yield "b";
}

function* func2() {
  yield* func1();
  yield 4 / 2;
  yield 5 / 2;
}

const func = func2();

console.log(func.next()); // { value: 'a', done: false }
console.log(func.next()); // { value: 'b', done: false }
console.log(func.next()); // { value: 2, done: false }
console.log(func.next()); // { value: 2.5, done: false }
console.log(func.next()); // { value: undefined, done: true }
```

async functions are a sugar syntax for generator functions.For example let's call a sequence async functions like below code with callback functions:

```js
asyncFunction1(arg1, (err, result1) => {
  if (err) {
    console.error(err);
  } else {
    asyncFunction2(result1, (err, result2) => {
      if (err) {
        console.error(err);
      } else {
        asyncFunction3(result2, (err, result3) => {
          if (err) {
            console.error(err);
          } else {
            // Do something with the final result
          }
        });
      }
    });
  }
});
```

this is an example of old way to use asynchronous operation chain,It's out of fashion and tedious.Let's rewrite with generator functions:

```js
function* asyncFunctions() {
  try {
    yield asyncFunction1();
    yield asyncFunction2();
    yield asyncFunction3();
  } catch (err) {
    console.log(err);
  }
}
function run() {
  const generatorObject = asyncFunctions();

  function iterate(iterator) {
    const { done, value } = iterator.next();
    if (done) return value;

    return iterate(iterator);
  }

  iterate(generatorObject);
}

run();
```

Of course this is also bad way to write asynchronous operations,but ECMAScript 2017 (ES8) released async/await to make our life easier,async/await uses generator functions under the hood.Let's rewrite code with async/await.

```js
async function asyncFunctions() {
  try {
    const res = await asyncFunction1();
    const result2 = await asyncFunction2();
    const result3 = await asyncFunction3();
  } catch (err) {
    console.log(err);
  }
}
```
