Ardından, React Compiler’ın çalışmasını istediğimiz herhangi bir bileşene use memo; yorumunu ekleyebiliriz. Aşağıdaki örneği inceleyelim. Dikkat, bu örnekte ince bir hata var :)
import { useState } from "react";
// Bu fonksiyonu anlamanız gerekmez. Sadece uzun süren bir işlem olduğunu bilin
const expensiveCalculation = () => {
console.info("expensiveCalculation çalışıyor");
let result = 0;

// CPU-yoğun döngüler
for (let i = 0; i < 5000; i++) {
for (let j = 0; j < 5000; j++) {
result += Math.sin(i) \* Math.cos(j);
}
}

// Yavaş rekürsif Fibonacci
const fib = (n: number): number => (n <= 1 ? n : fib(n - 1) + fib(n - 2));
for (let i = 0; i < 25; i++) fib(i);

return result;
};

export default function App() {
console.info("app render ediliyor");
const [count, setCount] = useState(0);
const handleClick = () => {
setCount((prev) => prev + 1);
};
const result = expensiveCalculation();

return (
<>

<div>Sayaç: {count}</div>
<ButtonChild onButtonClick={handleClick} />
<p>Pahalı Hesaplama: {result}</p>
<Footer />
</>
);
}

function ButtonChild({ onButtonClick }: { onButtonClick: () => void }) {
"use memo";
console.info("ExpensiveChild render ediliyor");

return <button onClick={onButtonClick}>Alt bileşenden artır</button>;
}

function Footer() {
"use memo";
console.info("footer render ediliyor");

return <div>Altbilgi</div>;
}

Bu dosyanın neden çalışmadığını gösteren bir video ekleyeceğim.

Gördüğünüz gibi, use memo yorumu ile açıkça bileşenleri seçmemize rağmen memoizasyon işlemi çalışmadı. Bunun nedeni, yeniden render’lara neden olmayan alt bileşenleri seçmemizdir. Şimdi App.tsx bileşeninin kendisini seçelim ve sonucu görelim.
import { useState } from "react";
// Bu fonksiyonu anlamanız gerekmez. Sadece uzun süren bir işlem olduğunu bilin
const expensiveCalculation = () => {
console.info("expensiveCalculation çalışıyor");
let result = 0;

// CPU-yoğun döngüler
for (let i = 0; i < 5000; i++) {
for (let j = 0; j < 5000; j++) {
result += Math.sin(i) \* Math.cos(j);
}
}

// Yavaş rekürsif Fibonacci
const fib = (n: number): number => (n <= 1 ? n : fib(n - 1) + fib(n - 2));
for (let i = 0; i < 25; i++) fib(i);

return result;
};

export default function App() {
"use memo";
console.info("app render ediliyor");
const [count, setCount] = useState(0);
const handleClick = () => {
setCount((prev) => prev + 1);
};
const result = expensiveCalculation();

return (
<>

<div>Sayaç: {count}</div>
<ButtonChild onButtonClick={handleClick} />
<p>Pahalı Hesaplama: {result}</p>
<Footer />
</>
);
}

function ButtonChild({ onButtonClick }: { onButtonClick: () => void }) {
console.info("ExpensiveChild render ediliyor");

return <button onClick={onButtonClick}>Alt bileşenden artır</button>;
}

function Footer() {
console.info("footer render ediliyor");

return <div>Altbilgi</div>;
}

Memoizasyonu gösteren bir video ekleyeceğim.

Bu kadar.
Son Notlar

React Compiler aynı zamanda React Forget olarak da bilinir.
React Compiler, performans optimizasyonu için derleme sürecine başka bir kod yorumlama katmanı ekler. Memoizasyonun mantığı bozabileceği bir bileşenle karşılaştığında, bunu atlar ve bir sonrakine geçer.
