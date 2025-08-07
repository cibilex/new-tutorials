React Derleyici
Şimdiye kadar, gereksiz yeniden render’ları azaltmak için fonksiyonlar için useCallback, karmaşık hesaplamalar için useMemo ve bileşen memoizasyonu için memo kullanıyorduk. Bu yardımcılar harika olsa da, kod yazımını sıkıcı ve karmaşık hale getiriyor. Öte yandan, react-compiler, yalnızca küçük bir yapılandırma ile tüm bu işlemleri otomatik olarak yapıyor. Bu, bileşenin kodunu derleme zamanında analiz ederek bileşenleri, hook’ları ve pahalı hesaplamaları otomatik olarak memoize eden bir Babel eklentisidir.
React Compiler’ı anlamak için temel bir örnek oluşturalım:
create-vite react-compiler --template react-ts
cd react-compiler
npm i
npm run dev

Yukarıdaki komutlarla, Vite ile bir React uygulaması oluşturduk ve projeyi çalıştırdık. http://localhost:5173 adresine bakarsanız, çalışan uygulamayı görmelisiniz.
Yeniden render’ları daha iyi yakalamak için react-scan kuralım:
npm i react-scan

ve main.tsx dosyasını react-scan’i etkinleştirecek şekilde yapılandıralım:
// import { StrictMode } from "react"; // çift render’ı devre dışı bırakmak için bu satırı kaldırın
import { createRoot } from "react-dom/client";
// import "./index.css"; // css’yi devre dışı bırakmak için bu satırı kaldırın
import App from "./App.tsx";
import { scan } from "react-scan"; // React ve React DOM’dan önce içe aktarılmalı

scan({
enabled: true,
});
createRoot(document.getElementById("root")!).render(<App />);

Son olarak, açıklamaya başlamak için App.tsx dosyasını yapılandıralım:
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
console.info("ExpensiveChild render ediliyor");

return <button onClick={onButtonClick}>Alt bileşenden artır</button>;
}

function Footer() {
console.info("footer render ediliyor");

return <div>Altbilgi</div>;
}

Burada bir ekran kaydı ekleyeceğim, böylece ilk örneği görebilirsiniz.
Gördüğünüz gibi, her tıklama olayında hem alt bileşenler hem de expensiveCalculation tetikleniyor, ancak count yalnızca App bileşeni tarafından kullanılıyor. Bu davranış, gerçek projelerde büyük bir maliyet doğurur. Şimdiye kadar, yeniden render sorunlarını önlemek için useMemo, useCallback ve memo hook’larını kullanıyorduk. Bunları ekleyelim ve neler olduğunu görelim:

import { memo, useCallback, useMemo, useState } from "react";
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
const handleClick = useCallback(() => {
setCount((prev) => prev + 1);
}, []);
const result = useMemo(() => expensiveCalculation(), []);

return (
<>
<div>Sayaç: {count}</div>
<ButtonChild onButtonClick={handleClick} />
<p>Pahalı Hesaplama: {result}</p>
<Footer />
</>
);
}

const ButtonChild = memo(({ onButtonClick }: { onButtonClick: () => void }) => {
console.info("ExpensiveChild render ediliyor");

return <button onClick={onButtonClick}>Alt bileşenden artır</button>;
});

const Footer = memo(() => {
console.info("footer render ediliyor");

return <div>Altbilgi</div>;
});

Performans iyileşmesini göstermek için bir video ekleyeceğim

Gördüğünüz gibi, yeniden render sorununu çözmek için çok fazla çaba harcadık ve projemizin karmaşıklığı sadece bu sıkıcı iş için arttı. React Compiler, bu sorunları varsayılan olarak otomatik bir şekilde çözer. Bu kurulumun Vite için olduğunu unutmayın. Farklı platformlar için kurulum yollarını görmek için buraya tıklayın.
npm install -D babel-plugin-react-compiler@rc

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
plugins: [
react({
babel: {
plugins: ["babel-plugin-react-compiler"],
},
}),
],
});

eslint-plugin-react-hooks, React kurallarını ihlal ettiğimizde bizi uyaran bir pakettir ve çoğu şablonda zaten bulunur. Vite ile proje oluşturduysanız, bu zaten yüklü olabilir. React Compiler hala geliştirme aşamasında olduğu için, derleyici kurallarını da almak için eslint-plugin-react-hooks paketini @rc (release candidate) bayrağıyla kurmalıyız.
npm install -D eslint-plugin-react-hooks@rc

// .eslintrc.js
rules: {
"react-hooks/react-compiler": "error",
}

Bu kadar. Şimdi App.tsx’deki yeniden render sorununu çözmek için yaptığımız değişiklikleri geri alalım:
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
console.info("ExpensiveChild render ediliyor");

return <button onClick={onButtonClick}>Alt bileşenden artır</button>;
}

function Footer() {
console.info("footer render ediliyor");

return <div>Altbilgi</div>;
}

Performans iyileşmesini göstermek için uygun bir video ekleyeceğim

Gördüğünüz gibi, React Compiler, hiçbir kod düzenlemesi ve karmaşıklık olmadan aynı şeyi yaptı. Bu harika görünüyor, ancak neden ve ne zaman bu derleyiciyi kullanmamız gerektiğini ve ne zaman kullanmamamız gerektiğini görmeliyiz.

React@19+ için herhangi bir yapılandırmaya gerek yoktur, ancak React@17+ gibi daha eski sürümler için React Compiler’ı kullanmak biraz çaba gerektirir. Adımları görmek için buraya tıklayın. Ayrıca bu kılavuz, Vite yapılandırmasını içerir.

React Compiler kurulumunu doğrulamak için, Component sekmesinin yanında ✨ metnini görmelisiniz.

Belirli Bileşenleri Hariç Tutma
Eğer React Compiler beklenmedik davranışlara neden oluyorsa, ilgili bileşenin başında "use no memo"; kullanarak React Compiler’ı o bileşen için devre dışı bırakabiliriz.
export default function App() {
"use no memo";
// ...
}

Kademeli Benimseme
Projemiz zaten üretimdeyse, yan etkilere neden olma olasılığı düşük olsa da, React Compiler’ı kademeli olarak eklemek önerilen bir yaklaşımdır. Uygulamanıza react-compiler’ı kademeli olarak eklemenin iki yolu vardır.

1. Yola Özgü
   Babel’i yalnızca belirli yollarda çalışacak şekilde yapılandırabiliriz.
   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
plugins: [
react({
babel: {
plugins: [], // Burada global babel-plugin-react-compiler olmadığından emin olun
overrides: [
{
test: [/src\/components\/with-compiler\/.*\.(js|jsx|ts|tsx)$/],
plugins: ["babel-plugin-react-compiler"],
},
],
},
}),
],
});

React Compiler, yalnızca src/components/with-compiler içindeki dosyalarda çalışır. 2. Yorum Modu
İkinci yol, yorum modunu kullanmaktır, böylece React Compiler yalnızca use memo; yorumu eklenmiş bileşenlerde çalışır.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
plugins: [
react({
babel: {
plugins: [
[
"babel-plugin-react-compiler",
{
compilationMode: "annotation",
},
],
],
},
}),
],
});

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
