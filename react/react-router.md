# React Router

react-error-boundary

React router Modes

1. **Library Mode**

   - **Declarative Mode**: Routelar JSX içinde tanımlanır. Küçük projelerde hızlı ve pratiktir ancak uygulama büyüdükçe kontrol zorlaşır ve gelişmiş özellikleri desteklemez.
   - **Data Mode**: Routelar bir obje dizisiyle tanımlanır. Daha düzenli, ölçeklenebilir bir yapı sağlar ve loader, action, errorElement, defer gibi modern React Router özellikleriyle tam uyumludur.Bu nedenle SPA geliştirme için önerilen yaklaşımdır.

2. **Framework Mode**
   Framework Mode, Data Mode’un tüm özelliklerine ek olarak SSR, hydration ve full-stack geliştirme yetenekleri getirir. Dosya bazlı routing ve co-location sayesinde büyük projelerde maintainability avantajı sunar.
   Framework Mode sadece SSR için değildir — SPA olarak da çalışabilir. Ancak bu modda bazı davranışlar Library Mode’dan farklı olabilir.Örneğin:Framework modunda `loader` hem sunucuda hem istemcide çalışabilen bir yapıya sahiptir. Eğer SSR aktifse loader, sayfa yüklenmeden sunucu tarafında çalışır. SSR kapalıysa `clientLoader` kullanılır ve Data Mode davranışına benzer hale gelir.

- **Data Mode**:

- Component?: [ComponentType](https://api.reactrouter.com/v7/interfaces/react_router.IndexRouteObject.html#Component) → Daha önce tanımlanmış React bileşenini alır. İlgili path match edildiğinde bileşen render edilir.
- element?: [ReactNode](element) → React bileşenini JSX olarak yazmaya izin verir. Component ile aynı amaca hizmet eder; tek fark kullanım şeklidir.
- children: [RouteObject[]](https://reactrouter.com/start/data/route-object#route-object) → Nested routing tanımlamak için kullanılır.

Yapacağımız tüm yaklaşımlarda aşağıdaki structure elde etmeye çalışacağız.

```bash
/ (layout)
 ├─ index route (home)
 └─ /orders (with orders layout)
      ├─ index route (orders list)
      └─ /orders/:id (order detail)
```

```tsx
import { createRoot } from "react-dom/client";
import {
  NavLink,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useParams,
} from "react-router";
import "./assets/css/main.css";

const router = createBrowserRouter([
  {
    // path yazılmadan Component/element tanımlanırsa Layout görevini üstlenir
    Component: Navbar,
    children: [
      {
        index: true, // index:true => root için başlangıç route’u olur
        Component: () => <div>home page</div>,
      },
      {
        path: "orders", // Nested routingte relative path kullanılmalıdır
        element: (
          <div>
            orders root / <Outlet />
          </div>
        ),
        children: [
          {
            index: true,
            element: <div>orders page</div>,
          },
          {
            path: ":id", // Route parametre tanımlamak için : kullanılır
            Component: () => {
              const { id } = useParams<{ id: string }>();
              return <div>order detail page {id}</div>;
            },
          },
        ],
      },
    ],
  },
  {
    path: "*", // 404 fallback route
    Component: () => <div>404 page</div>,
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
```

- **Framework Mode**:

  - Routelar app/routes.ts dosyasında tanımlanır.Router tanımlarken üç ana helper fonksiyon kullanılır:
  - **layout(file: string, children?: RouteConfigEntry[])**: Data Mode’daki path vermeden component tanımlamaya benzer. Layout oluştururken kullanılır.
  - **index(file: string, options?: CreateIndexOptions)**: Data Mode’daki index: true davranışına denktir. Root veya child index route için kullanılır.
  - **route(path: string, file: string, children?: RouteConfigEntry[])**: İlk parametre URL path, ikinci parametre route module‘dür. Route module React Router conventions içerir.Route dosyalarındaki export isimleri davranışı belirler:
    | Export | Ne işe yarar | Data Mode karşılığı |
    | -------------------------------------- | ------------------------------- | ------------------- |
    | `export default Component` | Route rendering yapan Component | `Component` |
    | `export async function clientLoader()` | SPA tarafında çalışan loader | `loader (client)` |
    | `export async function loader()` | SSR tarafında çalışan loader | ❗ Sunucuda çalışır |

  - Yukarıdaki Data mode structurını framework modu ile yazmak istersek:

```tsx
import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  layout("routes/layouts/index.tsx", [
    index("routes/index.tsx"),
    route("/orders", "routes/orders.tsx", [
      index("routes/orders/index.tsx"),
      route(":id", "routes/orders/order-detail.tsx"),
    ]),
  ]),
  route("*", "./catchall.tsx"),
] satisfies RouteConfig;
```

`order-detail.tsx` dosyamız aşağıdaki gibidir:

```tsx
import type { Route } from "./+types/order-detail"; // bunu import etmek çok önemli, bu sayede type-safe parametreleri almış oluruz.

function orderDetail({ params }: Route.ComponentProps) {
  return <div>order detail page {params.id}</div>; // type sayfe parametreler.Autocomplete olur.
}

export default orderDetail;
```

Ancak layout.tsx dosyamıza da bakalım:

```tsx
import { NavLink, Outlet } from "react-router";

function Navbar() {
  return (
    <>
      <div className="flex justify-around">
        <NavLink to="">home</NavLink>
        <NavLink to="/orders">orders</NavLink> // burdaki tipler type-safe değildir
        !!.
        <NavLink to="/orders/1">order detail</NavLink>
      </div>
      <Outlet />
    </>
  );
}

export default Navbar;
```

**File-based routing**: framework modu ile kullanılabilir (`npm i @react-router/fs-routes` gereklidir). Default `app/routes` klasörünü kullanır fakat `rootDirectory` ile değiştirilebilir. Dosya adlandırmaları route yapısını otomatik belirler.

- **\_index.tsx**: Data mode’daki index:true ile aynıdır, bulunduğu klasörün varsayılan route'udur.

- **page-name.tsx**: Eğer altında ilgili pattern’e uyan başka route varsa layout gibi davranır (layout() fonksiyonu hissiyatı). Eğer yoksa tekil route module’dür (route() fonksiyonuna denktir). Yani dosyanın projedeki konumu ve varlığıne göre davranışı değişir.

- **Dot notation**: Nested routing oluşturur. orders.detail.tsx → /orders/detail.
- **Dynamic route**: Route parametre tanımlamak için kullanılır. orders.$id.tsx → /orders/:id. Tipler otomatik olarak type-safe gelir.

```bash
routes
 ├─ _index.tsx         // /
 ├─ orders.tsx         // layout
 ├─ orders._index.tsx  // /orders
 ├─ orders.$id.tsx     // /orders/:id
 └─ $.tsx              // fallback / 404
```

- Type Safety Farkı
  Framework Modu, route helper'ları ile tanımlanan rotalar için tip üretebilen bir konvansiyon kullandığından, order-detail.tsx örneğinde görüldüğü gibi URL parametrelerini (params) type-safe hale getirebilir.

Ancak, React Router'ın temel NavLink bileşeninde kullanılan to prop'u, Framework Mode'da bile varsayılan olarak type-safe değildir ve rota yolları için otomatik tamamlama sunmaz. Bu durum, TanStack Router'ın yerleşik type-safety özelliği ile karşılaştırıldığında önemli bir farktır.

TanStack Router

TanStack Router 2 farklı şekilde route tanımlamayı destekler:

1. **File-Based Routing**: React Router’ın file-based routing mantığına çok benzer.
   Default root: src/routes, ancak `vite.config.ts` dosyasında `routesDirectory` seçeneği ile değiştirilebilir.
   `npm install -D @tanstack/eslint-plugin-router`: https://tanstack.com/router/latest/docs/eslint/eslint-plugin-router
   `npm install @tanstack/react-router @tanstack/react-router-devtools`
   `npm install -D @tanstack/router-plugin`

- Kurallar:
- `__root.tsx` → application root layout (iki alt çizgi kritiktir).
- `path-name.tsx`: Eğer aynı isimde bir klasör varsa ve içinde routing kurallarına uygun alt dosyalar (ör. index.tsx, $id.tsx) bulunuyorsa, dosya layout gibi davranır; eğer aynı isimde klasör yoksa veya klasör olsa bile içinde route tanımlayan dosyalar yer almıyorsa, bu durumda normal bir route (sayfa) olarak yorumlanır.
- `index.tsx` → React routerdaki index:true mantığıyla aynı.
- `Dynamic Routes` → $ prefix ile parametre tanımlanır ($id.tsx → /orders/:id).
- `Nested Routes` → iki yöntemi destekler:
  - `Dot notation`: orders.detail.tsx → /orders/detail
  - `Folder-based`: orders/$id.tsx gibi klasör içinde hiyerarşik tanım.
- `404 Page`: `createRouter()` içindeki `defaultNotFoundComponent` ile atanır.

Layout belirleme:

- Default olarak 2 farklı seçeneğimiz mevcut. path-name/index.tsx ve path-name/about.tsx dosyalarının olduğunu varsayalım.

1. path-name.tsx
2. path-name/route.tsx : Default olarak `route` isimli dosya layout dosyası olacaktır.Bunu değiştirmek için `vite.config.ts` dosyasında `routeToken` değerini değiştirebiliriz.
   örnek dosya yapısı:

```
src/routes/
  __root.tsx // ana layoutu temsil eder.
  index.tsx  // ana sayfayı temsil eder
  orders.tsx // orders sayfasının layoutunu temsil eder.
  orders/
    index.tsx // ana orders dosyasını temsil eder.
    $id.tsx // order detay sayfasını temsil eder.
```

Yukarıdaki yapıyı kurduğumuzda, yazımızın başındaki route sistemini oturtmuş oluruz.Örnek `/orders/$id.tsx` dosyası:

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/orders/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams(); // type-safety şekilde infer eder.
  return <div>order detail page {id}</div>;
}
```

Also we can use `useParams({ from: "/orders/$id" })` to get type-safe params.

Örnek \_root.tsx dosyamıza bakalım.Bu dosyada kullandığımız `Link` bileşenini çok seveceksiniz. `to` attribute değeri autocomplete olur, yanlış bir değer girdiğinizde hata verir. Hatta `/orders/$id` yazarsanız ve params değeri yok ise bunun hatasını da verir.Nice DX(Develoer experience)

```tsx
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function Navbar() {
  return (
    <>
      <div className="flex justify-around">
        <Link to="/">home</Link>
        <Link to="/orders">orders</Link>
        <Link to="/orders/$id" params={{ id: "1" }}>
          order detail
        </Link>
      </div>
    </>
  );
}

function RootComponent() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
```

1. [Code based routing](https://tanstack.com/router/latest/docs/framework/react/routing/code-based-routing): Daha fazla yazıyı uzatmamak için bu syntaxı da yazmayacağım. Kendiniz path tanımlamalarını yapmak isterseniz kullanabilirsiniz.

### Code Autosplitting

Modern bundler’lar (Vite/Webpack/Turbopack) projeyi varsayılan olarak tek veya az sayıda büyük chunk hâline getirir. Kullanıcı uygulamayı yüklediğinde bu chunk’ın tamamı indirilir—kullanıcı hiçbir zaman ziyaret etmeyeceği bir sayfanın kodu bile başlangıçta yüklenmiş olur.

**Code-splitting**, modüllerin bağımlılıklarına göre daha küçük parçalara (**chunk**) ayrılması ve bunların import() (**dynamic import**) ile talep edildiğinde yüklenmesi anlamına gelir.React'taki lazy() bu dinamik import mantığını kullanır.
TanStack Router, route dosyasındaki üyeleri iki kategoriye ayırır:

1. **Kritik Route Konfigürasyonu**:Path parsing, Dynamic params,Search params schema,Route context,Scripts / links / styles
2. **Kritik Olmayan Route Konfigürasyonu**: component,errorComponent,notFoundComponent
   Opsiyonel: `pendingComponent` , `loader` (Lazy loader kullanılırsa preload davranışı değişir ve çok dikkat ister.)
   Router build aşamasında bu non-critical üyeler için dinamik import noktaları oluşturur.Chunk yapısı bundler tarafından otomatik belirlenir; TanStack Router yalnızca nerenin lazy olacağını bildirir.
   Ayrıca lazy loading yapılmak istenen bileşenler `export` edilmemeli yoksa ana istek içerisinde her zaman yüklenirler. !!

```bash
/ (layout)
 ├─ index route (home)
 └─ /orders (orders layout)
      ├─ index route (orders list)
      └─ /orders/:id (order detail)
```

Kullanıcı home sayfasında iken: `Root layout` + `Home component` + `/orders altındaki tüm route'ların kritik konfigürasyonları ` yüklenir.Ancak `/orders` ve altındaki component chunk’ları indirilmez.Bunu test etmek için `DevTools → Network → JS filtresi` ile `/orders/index.tsx` sayfasına bakarsanız

```ts
export const Route = createFileRoute("/orders/")({
  component: lazyRouteComponent($$splitComponentImporter, "component"),
});
```

tarzında bir kod görmelisiniz ve bu bileşende kullandığınız bileşenlerin sayfada olmadığını sadece dinamik import mantığı için küçük bir kod olduğunu görmelisiniz. Ayrıca `vite-bundle-analyzer` daha iyi şekilde bu durum incelenebilir.

Kullanıcı `/orders/:id` sayfasına gittiğinde: İlgili layout + component chunk’ı dinamik import ile yüklenir.Kritik konfigürasyon zaten upfront olduğu için router parsing aşaması minimum maliyetle gerçekleşir.

- **Preloading**: Preloading, bir route’ın kodunu ve/veya loader datasını kullanıcı gelmeden önce hazır hâle getirme işlemidir. İlgili sayfa browserda yok ise yükler + `loader` fonksiyonu çalıştırılır.Varsayılan olarak preload kapalıdır.Preloading tetikleme seçenekleri:

  - `intent` : Kullanıcı bir `Link` elementinin üzerine geldiğinde veya tıkladığında ilgili sayfa yok ise tetiklenir
  - `viewport`: İlgili sayfanın `Link` elementi kullanıcının görüş alanına girdiğinde ilgili sayfa tetiklenir
  - `render`: İlgili sayfanın `Link` elementi render edildiği andak ilgili sayfa tetiklenir.

  Agresifliği `render` > `viewport` > `intent` olarak tanımlayabiliriz. `intent` çoğu durumda bizim için yeterli olacaktır. Diğer seçenekler gereksiz isteklere neden olabilir.
  Preload olan bir route , 30 saniye boyunca ziyaret edilmez ise ilgili veri silinir. Bu süreyi `defaultPreloadStaleTime` ile değiştirebiliriz. Eğer tanstack query veya farklı bir external cache kütüphanesi kullanıyorsak bu süreyi `0` ile eşitleyebiliriz. Böylece verimiz tek bir yerde saklanır.Preload edilince sayfanın geri kalan chunkları indirilir ama stale olmaz çünkü chunklar tarayıcı cache’ine aittir; TanStack Router yalnızca loader datasını yönetir.

### **Path Params**

- **Dinamik path tanımı**: Dosya adında `$` kullanılarak dinamik segmentler tanımlanır. Örnekler: `$id.tsx`, `users.$id.tsx`.
- **Gelişmiş path tanımları**: Dosya adında `{}` kullanılarak sabit ve dinamik segmentler birlikte tanımlanabilir. Örnek: `/users/user-{$id}.tsx`.
- **Param tipleri**: Path parametreleri otomatik olarak tiplenir ve route bağlamına göre güvenli şekilde kullanılır.

- **Loader ve lifecycle hook’ları**: `loader` ve `beforeLoad` içinde `params` doğrudan argüman olarak alınır: `({ params }) => params.id`.

- **Component içinde param kullanımı**:
  - `useParams({ from: "/users/$id" })` ile route bazlı param okunabilir.
  - `Route.useParams()` route config import edilebiliyorsa kullanılabilir.
  - **Code-split component’ler için önerilen yöntem**: Route dosyasını import etmeden tipli paramlara erişmek için `getRouteApi("/users/$id")` kullanılır.

```tsx
import { getRouteApi } from "@tanstack/react-router";

const Route = getRouteApi("/users/$id");

function UserDetail() {
  const params = Route.useParams();
  return <div>UserDetail {params.id}</div>;
}
```

### Search Params

`URLSearchParams` kullanılabilir ancak TanStack Router validation, parsing, type-safety ve default/fallback yönetimini otomatik sağlar; `JSON.stringify / parse` gerekmez.

- **validation**: `validateSearch` route match aşamasında çalışır, component render edilmeden önce parse + validation yapılır; Zod / Valibot desteklidir ve hata durumunda route error state’e düşer.

```tsx
const productSearchSchema = z.object({
  page: z.number(),
  limit: z.number().default(10),
});
export const Route = createFileRoute("/orders/$id")({
  validateSearch: productSearchSchema,
});
```

- **validation problem**: URL yanlış değerlerle açılırsa (?page=abc) route crash olur; çoğu senaryoda istenmeyen davranıştır.
- **@tanstack/zod-adapter**: Zod catch tek başına kullanıldığında type’lar unknown olur; adapter input/output type ayrımını korur, fallback ile crash’i önler ve search’ü her zaman tipli tutar.

```ts
const productSearchSchema = z.object({
  page: fallback(z.number(), 2),
  limit: fallback(z.number(), 10).default(10),
});
export const Route = createFileRoute("/orders/$id")({
  validateSearch: zodValidator(productSearchSchema),
});
```

- **Accessing Search Params**:
  - **beforeLoad**: It will be passed directy with `search` key.
  - **components**: we can use `Route.useSearch()` or `useSearch({ from: "/orders/$id" })`. Remember if you are a different page from the definition root, instead of importing the Route, use `getRouteApi`
  - **loader**: We need to use `loaderDeps` function to pick just the necessary search params like below

```bash
  loaderDeps: ({ search: { page, limit } }) => ({ page, limit }),
  loader: async ({ deps: { page, limit } }) => {
    console.log(page, limit, "page and limit");
    // ...
  },
```

- **Updating search params**:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useState } from "react";

const productSearchSchema = z.object({
  page: fallback(z.number(), 2),
  limit: fallback(z.number(), 10).default(10),
});

export const Route = createFileRoute("/orders/$id")({
  component: RouteComponent,
  validateSearch: zodValidator(productSearchSchema),
});

function RouteComponent() {
  const { page, limit } = Route.useSearch();
  const [value, setValue] = useState({
    page,
    limit,
  });
  const navigate = Route.useNavigate();

  const handleClick = () => {
    navigate({
      from: Route.to,
      search: { page: value.page, limit: value.limit },
    });
  };
  return (
    <>
      <input
        type="number"
        value={value.page}
        onChange={(e) => setValue({ ...value, page: Number(e.target.value) })}
      />
      <button onClick={handleClick}>Submit</button>
    </>
  );
}
```

- **Not**: `search` değeri veri yerine fonksiyon tipini de alabilir `search:prev=>(...prev,limit:1)` tarzında daha güvenli yaklaşımlar da uygulanabilir.

### Navbar oluşturma:

- Uygulamamızdaki header kısmını yaparken her sayfa için farklı bir Link elementi tanımlamak için genellikle `const appLinks=` tarzında bir array objesi oluşturup bunun üzerinde loop yaparken yapmak daha doğrudur. Bunu yaparken `appLinks` kısmında hatalı bir şey yapmadığımızı garanti etmek için `linkOptions` kullanabiliriz.Örnek:

```tsx
const links = linkOptions([
  {
    to: "/",
    metadata: {
      label: "Home Page",
    },
  },
  {
    to: "/orders",
    metadata: {
      label: "Orders page",
    },
  },
  {
    to: "/users",
    metadata: {
      label: "Users page",
    },
  },
]);

function Navbar() {
  return (
    <div className="flex justify-around">
      {links.map(({ metadata, ...link }) => {
        return (
          <Link key={link.to} {...link}>
            {metadata.label}
          </Link>
        );
      })}
    </div>
  );
}
```

### [Navigation Blocking](https://tanstack.com/router/latest/docs/framework/react/guide/navigation-blocking)

- If user tries to refresh page or quit the website, tanstack will look at the `onbeforeunload` event which is browser listener. Otherwise for example user tries to navigate between pages, tanstack will use its own listeners and check the whether the user can leave the page or not.We can take action according to user behavior

  - If user refresh the page or quit the website, browser default warning will be showed.
  - If the user navigate between links we can show our custom UI.
  - Options:

    - **withResolver**: By default `useBlocker` merely runs the `shouldBlockFn`, if we want to get returned value and show custom ui we should use `withResolver:true`.With this option `useBlocker` will return some values such as - `status`: A string literal that can be either 'blocked' or 'idle'
    - `reset`: reset - When status is blocked, a function that cancels navigation (status will be reset to `idle`)
    - `proceed` - When status is blocked, a function that allows navigation to continue - **enableBeforeUnload**: If we don't want to block user in case of refreshing the page or quitting page, we can set this value to `false`.

    Usually we will use this feature like below:

```tsx
export function IndexComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { proceed, status, reset } = useBlocker({
    shouldBlockFn: ({ next }) => {
      if (next.routeId === "/users") return true;
      if (count % 10 > 5) return false;
      return true;
    },
    withResolver: true,
  });

  return (
    <div>
      <h1>Count: {count}</h1>
      {status === "blocked" && (
        <>
          <div className="flex justify-center gap-3">
            <button onClick={proceed}>Proceed</button>
            <button onClick={reset}>Cancel</button>
          </div>
        </>
      )}
    </div>
  );
}
```

###[ Navigation](https://tanstack.com/router/latest/docs/framework/react/guide/navigation):

- We can use `Link` element or `useNavigate` hook to navigate between pages.Both of them have `NavigateOptions` but `Link` element also has `LinkOptions`.
  - top `NavigateOptions`:
    - `replace`: add a new entry or replace the latest one with the one one.
    - `ignoreBlocker`: Even the page has a `useBlocker`, ignore it and navigate.
    - We don't have to mention `to`, `search` or `params` options I guess :)
  - top `LinkOptions`:
    - `preload`: override default `defaultPreload` option.
    - `disabled`: disable or not the element
    - `activeProps`: `FrameworkHTMLAnchorTagAttributes` : we can use this to add styles or other attributes in active state.
    - `inactiveProps`: `FrameworkHTMLAnchorTagAttributes`: we can use this to add styles or other attributes in inactive state.
    - `activeOptions`:
      - `exact`: default is `false`. This is an important option. For example although we are on the `/orders/detail.tsx` page, `/orders.tsx` file will marked as `active`.To prevent this and we should set this value to `true`.
      - `includeSearch`: default is `true`. This says that the page search params should be the same as provided search values. This one also should be `false` in many cases.
  - **Note**: Children component of `Link` element can be `React.ReactNode | ((state: {isActive: boolean;isTransitioning: boolean;}) => React.ReactNode)`. So we can use `isActive` prop and take action with this info in link child too :)

```tsx
function Navbar() {
  return (
    <div className="flex justify-around py-2 mb-2 border-b border-gray-200 ">
      {links.map(({ metadata, ...link }) => {
        return (
          <Link
            activeOptions={{
              exact: true,
              includeSearch: false,
            }}
            activeProps={{
              className:
                "bg-indigo-50 text-indigo-700 border-indigo-500 font-bold",
            }}
            inactiveProps={{
              className: "bg-gray-50 text-gray-700 border-gray-200",
            }}
            className="p-2 border rounded-md  shadow  hover:scale-105 active:bg-indigo-300 active:scale-95  duration-300"
            key={link.to}
            {...link}
          >
            {({ isActive }) => (
              <div>
                {metadata.label} {isActive ? "active" : "inactive"}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
```

### StaticData

- TanStack Router’da her route’a statik metadata ekleyebiliriz.Böylece UI veya authorization logic için route’a ait bilgileri saklar.Global tip tanımlama:

1. Tip tanımlamasını yapalım.

```tsx
// main.tsx
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }

  interface StaticDataRouteOption {
    showNavbar?: boolean; // navbar gösterilsin mi
    requiredPermissions?: Permission[]; // gerekli yetkiler
  }
}
```

2. Route seviyesinde permission tanımı: Her route kısmında staticData kısmına yetkilerini eklemeliyiz.

```tsx
// routes/users.tsx
export const Route = createFileRoute("/users/")({
  component: RouteComponent,
  staticData: {
    requiredPermissions: [PERMISSIONS.LIST_USERS],
  },
});
```

1. `__root.tsx` kısmında, `beforeLoad` ile global authorization

```ts
// ==========================
// 3️⃣ Root route – GLOBAL AUTH GUARD
// ==========================

export const RootRoute = createRootRouteWithContext<RootRouteContext>()({
  component: RootComponent,

  beforeLoad: ({ context, matches }) => {
    /**
     * matches → aktif route zinciri
     * root → layout → page
     * Her route’un staticData’sını okuyabiliriz
     */

    const requiredPermissions = matches
      .map((match) => match.staticData?.requiredPermissions)
      .flat()
      .filter(Boolean) as Permission[];

    /**
     * Hiç permission istenmiyorsa:
     * - Public page
     * - Kontrole gerek yok
     */
    if (requiredPermissions.length === 0) {
      return;
    }

    /**
     * User yoksa veya
     * User istenen permission’lardan hiçbirine sahip değilse
     */
    const hasPermission = context.userData?.permissionCodes?.some(
      (permission) => requiredPermissions.includes(permission as Permission)
    );

    if (!hasPermission) {
      /**
       * 404 atıyoruz çünkü:
       * - Sayfa varmış gibi davranmak istemiyoruz
       * - Security açısından daha doğru
       */
      throw notFound();
    }
  },
});
```
