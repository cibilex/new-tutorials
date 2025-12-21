# Shadcn

- Don't forget that you basically cannot use shadcn/ui with Vue.
- shadcn/ui bir component kütüphanesi değildir.Kendi component kütüphaneni doğrudan kendi codebase’in içinde kolayca oluşturmanı sağlayan bir araç setidir
- **Geleneksel Component Kütüphaneleri (MUI, AntD vb.)**:
  - Klasik UI kütüphanelerinde bir paket kurar ve hazır component’leri kullanırsın. İlk bakışta üretken gibi görünür, ancak uzun vadede ciddi problemler doğurur.

```tsx
import { Button } from "@mui/material";
<Button color="secondary" focusRipple />;
```

Geleneksel Kütüphanelerin Problemleri:

1. **Şeffaf olmayan API’ler:**: `color="secondary"` veya `focusRipple` gibi prop’ların ne yaptığını ya ezberlemen gerekir ya da sürekli dokümantasyona bakarsın. Davranış koddan net bir şekilde anlaşılmaz.
2. **Gizli implementasyon**: Component’in nasıl çalıştığını doğrudan göremezsin. Bir problemi anlamak veya debug etmek için kütüphanenin source code’una gitmen gerekir. Daha kötüsü, Cursor veya Copilot gibi araçlar çoğu zaman component’in desteklemediği prop’ları uydurur.
3. **Component’i genişletmek acı vericidir**: Yeni bir variant veya davranış eklemek istediğinde genellikle wrapper yazmalıyız.Shadcn ile bileşen kodunu codebase'ine indirdiği için wrapper ihtiyacı olmaz.
4. **Tailwind ile stil uyumsuzluğu**: Günümüzde çoğu ekip Tailwind kullanıyor, ancak klasik UI kütüphaneleri Tailwind için tasarlanmamış. Component’i özelleştirmek çoğu zaman kütüphaneyle savaşmaya dönüşüyor.

Shadcn'i kullanmaya başlamadan önce birkaç basit paketi öğrenmeliyiz.

1. **(tailwind-merge)[https://github.com/dcastil/tailwind-merge/blob/v3.4.0/docs/api-reference.md#twjoin]**: Tailwind class’larını güvenli şekilde birleştirmek için kullanılır.2 temel fonksiyon sunar:
   1. **twJoin(...classLists)**: false, null, undefined gibi geçersiz değerleri temizler, ancak class conflictlerini çözmez.
      - `twJoin("px-2 bg-red-200", undefined, "p-4", null)` => `px-2 bg-red-200 p-4`
      - `px-2` ve `p-4` birlikte kaldığı için çakışma oluşur.
   2. **twMerge(...classLists)**: twJoin’in yaptığı her şeyi yapar ve ayrıca çakışan Tailwind class’larını çözer.
      - `twMerge("px-2 bg-red-200", undefined, "p-4", null)` =>`bg-red-200 p-4`
      - Böylece en son gelen geçerli Tailwind utility kazanır. Bu, variant ve override’lar için kritiktir.
2. **class-variance-authority**: variant temelli bir bileşen oluşturmak zordur. Tipleri tanımlamak,çıktısını hesaplamak gibi işlemler manuel iş ister.Bunları esgeçip kolaylıkla bileşen propları için çıktı oluşturabilmek için kullanılır.Tailwind ile çalışırken tailwind classlarının autocomplate olabilmesi için `.vscode/settings.json` dosyasında aşağıdaki kodu eklemeyi unutmayın.

```ts
{
  "tailwindCSS.classFunctions": ["cva", "cx"]
}
```

3. **clsx**: clsx, koşullu class üretimi içindir. String, object ve array destekler; false | null | undefined değerleri otomatik eler. Tailwind çatışmalarını çözmez, sadece geçerli class listesini oluşturur.
   1. `clsx("bg-red-400", { fontWeight: false }, [undefined, "text-red-200", null])` => `bg-red-400 text-red-200`
      Aslında Shadcn mantığını kapmış olduk bile. Shadcn kullanmadan bu 3 paket ile kendi butonumuzu oluşturalım :)

```tsx
// Button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const buttonVariants = cva(
  [
    "font-medium border duration-200 rounded-md shadow cursor-pointer active:scale-95 hover:scale-105",
  ],
  {
    variants: {
      color: {
        green: [
          "bg-green-500 text-white border-green-500 hover:bg-green-600 hover:border-green-600",
        ],
        red: [
          "bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600",
        ],
        blue: [
          "bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600",
        ],
      },
      size: {
        sm: ["text-sm px-3 py-2"],
        md: ["text-base px-4 py-2"],
        lg: ["text-lg px-5 py-2"],
      },
    },
    defaultVariants: {
      color: "green",
      size: "md",
    },
  }
);

export function MyButton({
  className,
  text,
  color,
  size,
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { text: string }) {
  return (
    <button
      className={twMerge(clsx(buttonVariants({ color, size, className })))}
    >
      {text}
    </button>
  );
}
```

Kullanımı

```ts
      <MyButton text="Click me" />
      <MyButton text="Click me" color="red" size="sm" />
      <MyButton
        text="Click me"
        color="blue"
        className="shadow-2xl  underline"
      />
```

Gördüğünüz gibi artık ortak bileşen kullanmak bu kadar basit. Shadcn ile çalışırken bu mantığı çok kullanacağız. lütfen anlamadıysanız dökümanlarına gidip okuyunuz
Kurulum: `https://ui.shadcn.com/docs/installation/vite` linkine giderek yapılandırmanızı yapmalısınız. Ardından

- `npx shadcn@latest init`: Projenin temel kurulumunu yapar. `components.json` dosyasında ayarlarımız mevcuttur ve yukarıda belirttiğimiz yardımcı paketleri projeye kurar.Son olarak `src/lib/utils` dosyasında küçük bir helper fonksiyonu ekler.
- Bileşenleri projemize eklerken 2 seçeneğimiz var.
  - 1. `npx shadcn@latest add componentName` seçeneği ile otomatik eklemek.Biz bu yolu kullanacağız.
  - 2. `npm install @radix-ui/componentName` seçeneği ile ilgili paketi ekleyip ardından bileşeni manuel kopyalamak.

Örnek: `npx shadcn@latest add button`: `components.json` dosyamızda bu değişken ile ilgili dosyaları nereye ekleyeceğini öğrenir. Mesela şuanda `components.json` dosyamızda `"ui": "@/components/ui"` olduğundan . `src/components/ui` altına `button.tsx` eklenir ve kod buraya yapıştırılır.
Not: Tailwind buton bileşenlerinin hover efectini resetlediğinden dolayı `cursor:pointer` efektinin tüm butonlarda olmasını sağlamak için `cursor-pointer disabled:cursor-not-allowed` classını ekleyebiliriz.

- **[components.json](https://ui.shadcn.com/schema.json)** dosyasında çok önemli bazı seçenekleri kontrol edelim:

  - Kurulum aşamasında karar vermemiz gereken özellikler:
    - `style`: genel design prensibini belirtir. Default olarak `new-york` gelir ancak `radix ui` ve `base ui` seçenekleri için `vega`, `nova`, `maia`,`lyra` gibi seçenkleri mevcuttur.Yani `radix-nova` veya `base-lyra` seçebiliriz.
    - `tailwind.baseColor`: Projemizin temel themasını belirtir. Kullanacağımız temaya ait renk tonları seçilerek global css dosyamıza eklenir. `"gray" | "neutral" | "slate" | "stone" | "zinc"` seçenekleri olabilir.
  - Sonradan değiştirilebilen değerler.
    - `tailwind.css`: `@import "tailwindcss";` importunu kullandığımız global css dosyamızı temsil eder.Default olarak otomatik algılar.
    - `cssVariables:boolean=true` : shadcn'i init ettiğinizde global css dosyanızda renk değişkenlerinin tanımlandığını görürsünüz. `background` text için kullanılırken `foreground` arkaplan rengi için kullanılır.
    - `aliases.ui`: bileşenlerin nereye kopyalanacağını belirtir. Default olarak değer `@/components/ui` değeridir.

- **MCP Server**: `npx shadcn@latest mcp init --client claude` install this to my app.
