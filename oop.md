- (People don't understand OOP)[https://blog.sigma-star.io/2024/01/people-dont-understand-oop/]
- (Modern Javascript)(https://javascript.info/private-protected-properties-methods)
- http://latentflip.com/loupe/?code=JC5vbignYnV0dG9uJywgJ2NsaWNrJywgZnVuY3Rpb24gb25DbGljaygpIHsKICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gdGltZXIoKSB7CiAgICAgICAgY29uc29sZS5sb2coJ1lvdSBjbGlja2VkIHRoZSBidXR0b24hJyk7ICAgIAogICAgfSwgMjAwMCk7Cn0pOwoKY29uc29sZS5sb2coIkhpISIpOwoKc2V0VGltZW91dChmdW5jdGlvbiB0aW1lb3V0KCkgewogICAgY29uc29sZS5sb2coIkNsaWNrIHRoZSBidXR0b24hIik7Cn0sIDUwMDApOwoKY29uc29sZS5sb2coIldlbGNvbWUgdG8gbG91cGUuIik7!!!PGJ1dHRvbj5DbGljayBtZSE8L2J1dHRvbj4%3D
- https://www.jsv9000.app/
- https://www.builder.io/blog/visual-guide-to-nodejs-event-loop

# OOP

- OOP is a design model that organizes and structures code. Object-oriented programs are made up of objects.

- An object is a collection of state and procedures. An object bundles state (data) and procedures (methods/functions that act on that state). Objects can also encapsulate their state or procedures by means of public, private, or protected prefixes.

- Classes are not necessary for object-oriented programming. They are just an easy way to define objects. For example, we can also use constructor functions in JavaScript to create objects. Objects are the core of OOP, but classes are not. They are just a way to define objects. For example these definitions are the same.

  - ```js
    function Dog(name, age) {
      this.name = name;
      this.age = age;
      this.bark = function () {
        console.log(
          "Woof! My name is " +
            this.name +
            " and I am " +
            this.age +
            " years old."
        );
      };
    }

    Dog.prototype.sleep = function () {
      console.log(this.name + " is sleeping.");
    };
    Dog.prototype.owner = "John";

    const dog1 = new Dog("Coco", 3);

    console.log(dog1.name); // Output: Coco
    dog1.bark(); // Output: Woof! My name is Coco and I am 3 years old.
    ```

  - ```ts
    class Dog {
      constructor(name, age) {
        this.name = name;
        this.age = age;
      }
      bark() {
        console.log(
          "Woof! My name is " +
            this.name +
            " and I am " +
            this.age +
            " years old."
        );
      }
    }

    Dog.prototype.sleep = function () {
      console.log(this.name + " is sleeping.");
    };
    Dog.prototype.owner = "John";

    const dog1 = new Dog("Coco", 3);

    console.log(dog1.name); // Output: Coco
    dog1.bark(); // Output: Woof! My name is Coco and I am 3 years old.
    ```

## Key OOP Principles: Subtyping, Encapsulation, and Object Creation

Below is a comparison of prominent OOP languages and how they support key OOP principles.

| Language   | Objs | Obj Creation         | Encapsulation                | Subtyping                                     |
| ---------- | ---- | -------------------- | ---------------------------- | --------------------------------------------- |
| JavaScript | ✔️   | Classes / Prototypes | ✔️ (since ES2022)            | Inheritance / Duck typing                     |
| TypeScript | ✔️   | Classes / Prototypes | ✔️                           | Inheritance / Structural typing / Duck typing |
| Python     | ✔️   | Classes              | ❌ (not on a language level) | Inheritance / Duck typing                     |
| Go         | ✔️   | Structs              | ✔️ (on package level)        | Structural typing                             |
| Rust       | ✔️   | Structs              | ✔️                           | Extension Traits / Nominal typing             |

OOP'nin dört temel ilkesi şunlardır:

## 1. Inheritance (Kalıtım)

- Bir alt sınıfın üst sınıftan özellik ve davranışları miras
  alabilmesidir.\
- Ortak yapılar üst sınıfta tanımlanır, alt sınıflar bu yapıları
  kullanarak kod tekrarını azaltır ve daha stabil bir yapı sağlar.\
- Örnek: `User` sınıfından türeyen `Admin` ve `Employee` sınıfları.\
- JavaScript/TypeScript'te `extends` ile kalıtım yapılır. Alt sınıfın
  `constructor` metodunda `super()` kullanılması gerekir. `super`, üst
  sınıfın constructor'ını çağırır.

---

## 2. Encapsulation (Kapsülleme)

- Nesnenin verilerinin (state) dış dünyadan nasıl erişileceğini ve
  değiştirileceğini kontrol eder.\
- Amaç: Nesnenin iç yapısını gizlemek, yalnızca belirlenmiş
  yöntemlerle dışarıya açmaktır.\
- Örneğin, bir değişkeni doğrudan değiştirmek yerine, özel metotlar
  ile değiştirilmesi sağlanır.

TypeScript erişim belirleyicileri: - **public**: Varsayılandır.
Dışarıdan erişilebilir. - **protected**: Yalnızca sınıf içinde ve alt
sınıflardan erişilebilir. - **private**: Sadece tanımlandığı sınıf
içinde kullanılabilir. - **readonly**: Değer yalnızca constructor'da
atanabilir, sonrasında değiştirilemez.

---

## 3. Polymorphism (Çok Biçimlilik)

- Aynı sınıftan türetilen nesnelerin farklı davranışlar
  sergileyebilmesidir.\
- İki türü vardır:

### a) Method Overloading (Metot Aşırı Yükleme)

- Aynı metot adıyla fakat farklı parametre imzaları ile birden fazla
  metot tanımlamaktır.\
- TypeScript buna izin verir.

Örnek:

```ts
function sumNumbers(a: number, b: number): number;
function sumNumbers(a: string, b: string): number;
function sumNumbers(a: number | string, b: number | string) {
  return Number(a) + Number(b);
}

console.log(sumNumbers(1, 2)); // 3
console.log(sumNumbers("1", "2")); // 3
```

### b) Method Overriding (Metot Ezme)

- Üst sınıftan gelen bir metodu alt sınıfta farklı şekilde yeniden
  tanımlamaktır.\
- Örneğin, `User` sınıfında `getRole()` metodu `"user"` dönerken,
  `Admin` sınıfında override edilip `"admin"` dönebilir.

---

## 4. Abstraction (Soyutlama)

- \[TODO\]\
- Nesnenin karmaşık detaylarını gizleyerek yalnızca gerekli olan
  davranışların dışarıya açılmasıdır.\
- JavaScript'te interface ve abstract class kullanılarak
  uygulanabilir.

---

OOP (Object-Oriented Programming) bir programlama dili değil, bir programlama paradigmasıdır (yani bir yaklaşım, düşünce tarzı).

"JavaScript OOP'dir" demek hatalı olur çünkü JavaScript sadece tek bir paradigmayı desteklemez.

Doğrusu: JavaScript, OOP programlamayı destekler. Ayrıca FOP (Functional Oriented Programming) yani fonksiyonel programlamayı da destekler. Hatta prosedürel programlamaya da uygundur.

--

### JavaScript Engine:

1. **Call Stack**

- Fonksiyonların ve methodların çalıştırıldığı alandır.JavaScript single-threaded olduğu için, stack’te aynı anda sadece bir fonksiyon çalışır.Call Stack, synchronous işlemlerin yönetiminden sorumludur.
- Örnek akış: Bir fonksiyon çağrılır → stack’e eklenir → çalıştırılır → çalışması tamamlanınca stack’ten çıkar.

2. **Heap**

- JavaScript’in unstructured memory alanıdır.
- Kod çalışırken oluşturulan nesneler, objeler ve referans tipleri burada saklanır.Primitive tipler (string, number, boolean, null, undefined, symbol) genellikle stack’te saklanır.Objeler, array’ler, function’lar gibi referans tipleri heap üzerinde tutulur.

## JavaScript Runtime

JavaScript engine (örneğin V8) kendi başına DOM API, fetch API veya callback queue gibi yapıları içermez. Bunlar, JS'in çalıştığı ortam (runtime environment) tarafından sağlanır. Browser ortamında (örneğin Chrome), JS engine'e entegre edilen Web APIs ve Event Loop mekanizması sayesinde async işlemler ve dış etkileşimler mümkün olur

- Web APIs (Browser Tarafından Sağlanan):

  - DOM API: HTML elementleriyle etkileşim için (örneğin document.getElementById()).
  - Fetch API veya XMLHttpRequest: External HTTP istekleri için (async network çağrıları).
  - Diğer örnekler: setTimeout, setInterval (timer APIs), console.log (console API).

- Event Loop ve Queue'lar (Async İşlemler İçin):
  - JS single-threaded olsa da, async kod (Promise, async/await, callbacks) event loop sayesinde non-blocking çalışır. Event loop, call stack boşaldığında queue'lardan task'ları stack'e taşır.
  - Callback Queue (Macrotask Queue): Async callbacks'ler burada bekler (örneğin setTimeout, DOM events, fetch callbacks). Browser'ın Web APIs'si bir işlem bittiğinde callback'i buraya ekler.
  - Microtask Queue: Daha yüksek öncelikli queue (örneğin Promise.then(), async/await). Event loop, her macrotask'tan sonra tüm microtask'ları işler.
  - Örnek Akış: Bir fetch çağrısı yapıldığında → Web API'ye gider → İşlem biter → Callback queue'ya eklenir → Event loop queue'dan call stack'e taşır → Kod çalışır.

### How JS works:

**Interpretation**: Kod, çalışma zamanında satır satır okunur ve bir yorumlayıcı tarafından anlık olarak işlenir (genellikle bytecode’a çevrilir ve çalıştırılır). Hızlı başlar ama tekrar eden işlemlerde yavaştır.

**Compilation**: Kodun tamamı veya büyük bir bölümü, çalıştırılmadan önce makine diline (veya optimize edilmiş bir forma) çevrilir. Derleme süresi alır ama çalışma hızlıdır.

**JIT**: Interpretation ve compilation’ı birleştirir. Kod, önce hızlıca bytecode’a çevrilir ve çalıştırılır (yorumlamaya benzer). Ardından, sık kullanılan kod parçaları tespit edilerek optimize edilmiş makine koduna çevrilir. Bu sayede, tekrar eden işlemler için yorumlama gerekmez, performans artar.İlk çağrıda: interpreter bytecode üretir ve çalıştırır.Çok çağrıldığında: JIT bunu optimize edip CPU’nun anlayacağı machine code’a çevirir → çok daha hızlı çalışır.

    - **JavaScript** kodu → insanlar tarafından okunabilir, yüksek seviyeli bir dildir.

    - **Makine dili (Machine Code)** → CPU’nun direkt anlayacağı düşük seviyeli komutlar.

    - **Bytecode** → bu ikisi arasında bir ara dil (intermediate representation / IR) olarak görev yapar.

### Execution Context (Yürütme Bağlamı)

Execution Context, JavaScript kodunun çalıştırıldığı soyut bir ortamdır. Kodun doğru bir şekilde çalışması için gerekli tüm bilgileri (değişkenler, fonksiyonlar, this değeri vb.) içerir. Her kod çalıştığında bir Execution Context oluşturulur ve Call Stack'e eklenir. İki temel türü bulunur:

- **Global Execution Context (GEC)**

  - Bir kod bloğu çalışmaya başladığında, ilk ve tek Global Execution Context oluşturulur.
  - Bu bağlam, global kapsamdaki tüm değişken ve fonksiyonları içerir.

- **Functional Execution Context (FEC)**
  - Herhangi bir fonksiyon çağrıldığında, o fonksiyona özel yeni bir Functional Execution Context oluşturulur ve Call Stack'e eklenir.

#### Hoisting

Execution Context'in oluşum aşaması sırasında, kod çalıştırılmadan önce değişkenler ve fonksiyonlar için bellek tahsisi yapılır. Bu sürece **Hoisting** denir.

- `var` ile tanımlanan değişkenler, Hoisting sırasında belleğe alınır ancak varsayılan değerleri `undefined` olarak atanır.
- `let` ve `const` ile tanımlanan değişkenler de hoist edilir, ancak bir değer ataması yapılana kadar **Temporal Dead Zone (TDZ)** adı verilen bir durumda kalırlar. Tanımlandıkları yerden önce kullanılmaya çalışıldıklarında **ReferenceError** hatası fırlatılır.

```ts
console.log(username); // undefined
var username = "cibilex";

console.log(surname); // ReferenceError: Cannot access 'surname' before initialization
let surname = "anderson";
```

## Fonksiyonlar ve Hoisting

Fonksiyonlar da Hoisting kurallarına tabidir:

- **Function Declaration** (`function name() {}`) → değerleriyle birlikte hoist edilir ve tanımlandıkları yerden önce çağrılabilir.
- **Function Expression** → değişken gibi davranır. `var` ile tanımlanan bir function expression, hoist edildiğinde sadece değişken adı belleğe alınır ve değeri `undefined` olur.

```ts
writeName("cibilex"); // cibilex
function writeName(name: string) {
  console.log(name);
}

console.log(typeof writeAge); // undefined
console.log(writeAge(99)); // TypeError: writeAge is not a function
var writeAge = (age: number) => console.log(age);
```

> TypeError, ReferenceError'dan farklıdır çünkü değişken tanımlıdır ama fonksiyon değildir.

### 🔍 `this` in the Global Context

`this` değeri bulunduğu scope’taki **execution context**’i temsil eder.  
Browser tarafında `this` değeri `window` objesi iken, Node.js tarafında `this` → CommonJS’de `{}`, ES Module’de `undefined`.

JavaScript’te `var` ile oluşturulan değişkenler default olarak `window` objesine eklenirken, `let` ve `const` ile oluşturulan değişkenler `window` objesine eklenmez.

```js
var username = "cibilex";
console.log(this.username, window.username, username);
// cibilex cibilex cibilex

const age = 99;
console.log(window.age, this.age, age);
// undefined undefined 99
```

### JavaScript Nasıl Çalışır

1. **Hoisting ve Global Execution Context (GEC) Oluşturma**

   - Kod çalıştırılmadan önce JavaScript motoru **Global Execution Context (GEC)** yaratır.
   - Bu aşama **Creation Phase** olarak bilinir.
   - Fonksiyon deklarasyonları belleğe tam tanımıyla yüklenir.
   - `var` ile tanımlanan değişkenler `undefined` yapılır.
   - `let` ve `const` değişkenleri ise **Temporal Dead Zone (TDZ)** içinde tutulur, erişmeye çalışıldığında hata fırlatır.

2. **Scope ve Lexical Environment Oluşturma**

   - Her execution context (global veya fonksiyon) kendi **Lexical Environment**’ını oluşturur.
   - Scope zinciri (Scope Chain) sayesinde iç içe fonksiyonlar dış ortamlardaki değişkenlere erişebilir.

3. **`this` Bağlamının Belirlenmesi**

   - Global context’te browser tarafında `this === window` olur.
   - Node.js tarafında `this`, modül sistemi nedeniyle çoğunlukla `{}` veya `undefined`’dir.
   - Fonksiyon çağrımına göre `this` farklı değerler alabilir (`call`, `apply`, `bind` gibi yöntemlerle değiştirilir).

4. **Execution Phase (Kodun Çalıştırılması)**

   - Kod satır satır yürütülür.
   - Hoisting sırasında `undefined` bırakılan değişkenler artık gerçek değerlerini alır.
   - Fonksiyon içindeki işlemler tamamlandıkça Lexical Environment güncellenir.

5. **Fonksiyon Çağrıları ve Call Stack**
   - Her fonksiyon çağrısı için yeni bir Execution Context oluşturulur ve **Call Stack**’e push edilir.
   - Call Stack **LIFO (Last-In, First-Out)** mantığında çalışır.
   - Alt fonksiyonlar için de ayrı execution context oluşturulur.
   - Fonksiyon çalışmasını tamamladığında (veya `return` edildiğinde), o Execution Context call stack’ten çıkarılır.

---

## Event loop

- JavaScript single-thread (tek iş parçacıklı) ve senkron çalışan bir dildir. Ancak çalıştığı runtime (tarayıcı veya Node.js) sayesinde asenkron işlemler yapılabilir.Event Loop bu asenkron yapıları organize eder:

- **Microtask Queue**

  - **Microtask**, JavaScript motorunun **call stack** boşaldıktan hemen sonra çalıştırdığı, yüksek öncelikli iş kuyruğudur.
  - **ECMAScript spesifikasyonu (ECMA-262)** ile tanımlandığından dolayı tüm JavaScript runtime ortamlarında (Chrome, Firefox, Edge, Safari, Node.js) bulunur.
  - Promise callback’leri, `async/await` işlemleri ve `queueMicrotask` ile eklenen görevler **microtask queue**’ya gider.

- **Macrotask (Callback Queue)**
  - Daha düşük önceliklidir.
  - `setTimeout`, `setInterval`, `setImmediate` (Node.js), DOM event callback’leri burada toplanır.
  - Microtask queue boşaldıktan sonra işleme alınır.

```js
console.log("A");

setTimeout(() => {
  console.log("B"); // Macrotask
}, 0);

Promise.resolve().then(() => {
  console.log("C"); // Microtask
});

console.log("D");
```

- 👉 Çalışma sırası: `A` > `D` > `C` > `B`

## Closure Nedir?

Bir fonksiyon kendi içinde başka bir fonksiyon oluşturduğunda, iç fonksiyon dış fonksiyonun değişkenlerine erişebilir.Dış fonksiyon sona erse bile iç fonksiyon bu değişkenlere erişmeye devam edebilir.

```ts
function outer() {
  let count = 0;

  function inner() {
    count++;
    console.log(count);
  }

  return inner;
}

const myCounter = outer();
myCounter(); // 1
myCounter(); // 2
myCounter(); // 3
```

## Node.js Nedir?

Node.js, bir programlama dili veya framework değildir. Google Chrome'un kullandığı güçlü **V8 JavaScript motoru** üzerine inşa edilmiş, açık kaynaklı, sunucu tarafında çalışan bir JavaScript runtime environment’tır.

Node.js’in en önemli özelliklerinden biri, **event-driven (olay yönelimli)** ve **non-blocking I/O (engellemeyen G/Ç)** modelini kullanmasıdır. Bu sayede aynı anda binlerce bağlantıyı çok az kaynakla yönetebilir.

---

## Node.js Ortamının Bileşenleri

### 1. V8 JavaScript Motoru

- JavaScript kodunu hızlı bir şekilde makine koduna çevirir.
- Kodun yürütülmesinden, bellek yönetiminden ve **Call Stack**’ten sorumludur.

### 2. libuv

- Node.js’in kalbinde yer alan, C++ ile yazılmış bir kütüphanedir.
- **Asenkron ve non-blocking I/O** işlemlerini (dosya sistemi, ağ istekleri vb.) arka planda yönetir.
- Zaman alıcı görevleri **önceden oluşturulmuş thread pool** üzerinde çalıştırır ve tamamlandığında sonucu **Event Loop**’a geri gönderir.Bu sayede **ana thread bloke olmaz**.
- Her bir thread, kendi başına bir görevi yürütebilen, işletim sisteminin en küçük işlem birimidir.
- Node.js’in **tek ana thread’i**, tüm JS kodunu (senkron kısmı) ve Event Loop’u çalıştırır.
- Bunun dışında **varsayılan olarak 4 iş parçacığından oluşan thread pool** bulunur.
- Default thread pool size: 4.Değiştirmek için: UV_THREADPOOL_SIZE ortam değişkeni kullanılır. `process.env.UV_THREADPOOL_SIZE` undefined ise default 4 değerini kullanır. `UV_THREADPOOL_SIZE=8 node app.js` şeklinde pool sayısı belirtilebilir.
- Thread pool meşgulken gelen IO’lar.libuv pending queue’ya düşer.Boş thread olunca queue’dan alınır ve çalıştırılır

#### I/O İşlemlerinin Akışı

1. **Görevin Devri**: Ana thread, I/O görevini libuv’a iletir.
2. **Arka Plan Çalışması**: libuv, thread pool’dan boşta olan bir thread seçer ve I/O işlemini bu thread üzerinde yürütür. Ana thread bu sırada bloke olmaz.
3. **Geri Çağrımın Kuyruğa Eklenmesi**: İşlem tamamlandığında ilgili callback, event loop’a iletilir.
   - `setTimeout` gibi işlemler → **Callback Queue / Macrotask Queue**
   - `Promise` gibi işlemler → **Microtask Queue**
4. **Kuyrukların Boşaltılması**: Event loop, Call Stack boşaldığında önce **Microtask Queue**, ardından **Callback Queue**’yu işler.

> Bu döngü sayesinde Node.js, tek ana thread’e rağmen birden fazla I/O işlemini aynı anda ve verimli şekilde yönetebilir.

### 3. Core Modules (Çekirdek Modüller)

- Node.js ile gelen yerleşik modüllerdir.
- Örnekler: `fs` (dosya sistemi), `http` (ağ), `path` (yol), `events` (olaylar).
- Tarayıcıda bu tür sistem seviyesinde modüller bulunmaz.

### 4. Event Loop (Olay Döngüsü)

- Tarayıcıdaki event loop ile benzer şekilde çalışır.
- libuv tarafından sağlanan asenkron işlemlerin sonuçlarını **Callback Queue** veya **Microtask Queue**’dan alır ve **Call Stack** boşaldığında çalıştırır.
- Node.js’in yüksek performansının temel nedenlerinden biridir.

### JavaScript Browser - Nodejs

- **Browser**: JS Engine single-threaded, asenkron işlemler Browser API’ler aracılığıyla yapılır.
- **Node.js**: JS Engine single-threaded, asenkron işlemler libuv ve thread pool sayesinde yapılır.
- Her iki ortamda da JavaScript’in kendisi senkron olsa da, runtime ortamı sayesinde **non-blocking ve async** işlemler mümkün olur.

### Blocking the Event Loop

```ts
// example 1
import fs from "fs/promises";

async function readFileExample() {
  try {
    const data = await fs.readFile("./oop.md", "utf-8");
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

readFileExample();
```

```ts
// example 2
import fs from "fs";

function readFileExample() {
  fs.readFile("./oop.md", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
}

readFileExample();
```

```ts
// example 3
import fs from "fs";

function readFileExample() {
  try {
    const res = fs.readFileSync("./oop.md", "utf-8");
    console.log(res);
  } catch (err) {
    console.log(err);
  }
}

readFileExample();
```

- Example 1 and 2 use Asynchronous operation,so Node.js does not block the main thread while reading the file but example 3 uses Synchronous operation: Node.js blocks the main thread until the file is completely read.Dangerous in servers: while reading a large file, no other requests can be processed, so it blocks the Event Loop.

Örnek Sorular:

1. Aşağıdaki kodda dog1.sleep() çağrısı hangi mesajı yazdırır?

```js
function Dog(name) {
  this.name = name;
}

Dog.prototype.sleep = function () {
  console.log(this.name + " is sleeping.");
};

const dog1 = new Dog("Coco");

dog1.sleep();

Dog.prototype.sleep = function () {
  console.log(this.name + " is napping.");
};

dog1.sleep();
```

A) Coco is sleeping → Coco is sleeping
B) Coco is sleeping → Coco is napping
C) Coco is napping → Coco is sleeping
D) Coco is napping → Coco is napping

Cevaplar:

#### 1.dog1 oluşturulduğunda sleep fonksiyonu prototype’tan alınır.Prototype değiştiğinde, dog1 hâlâ prototype’a bağlı olduğu için yeni metodu görür.Yani prototype metodunu değiştirmek tüm mevcut nesneleri etkiler, sadece sonradan oluşturulacak nesneleri değil.
