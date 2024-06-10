- https://nuxt.com/docs/getting-started/server#hybrid-rendering

https://i18n.nuxtjs.org/docs/guide/seo

Proje oluşturmak için : `npx nuxi@latest init projectName`  
nuxt update etmek için: `npx nuxi update`

Nuxt development ve production configurasyonlarını ayrı ayrı yapmamıza izin verir.

```ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  $production: {
    runtimeConfig: {},
  },
  $development: {
    runtimeConfig: {},
  },
});
```

.env dosyasına bakarak değişkenleri projeye verir.Dev ve prod ortamlarında farklı değişkenler .env.dev ve .env.prod ile farklı ortamlarda tutulur. .env dosyasında ise ortak değişkenler tutulur.Ardından package.json dosyasında istenilen dosya yolu yazılır.

```json
"scripts": {
"build": "nuxt build --dotenv .env.prod",
"dev": "nuxt dev --dotenv .env.dev",
}
```

Type desteğini sağlamak için ise şeklinde vite-env.d.ts dosyası oluşturularak tipleri verilebilir.

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

_runtimeConfig_: Secret keylerimiz gibi sadece server tarafında erişilmesi gereken hassas verileri tanımlamamızı sağlar.Ayrıca public değerinin altında hem frontend hemde server tarafında kullanılacak değişkenler yazılır.Public keyinin altında hassas veriler olmamalıdır.

ts
export default defineNuxtConfig({
runtimeConfig: {
mySecret: process.env.MY_SECRET,
public: {
baseURL: "http://localhost:8001",
},
},
});

ardından const configs=useRuntimeConfig() şeklinde kullanılır

_App configuration_ : Projemizde kullanılacak özelliklerin default değerlerini veya meta bilgileri tanımlamak için kullanılır.app.config.ts dosyasında defineAppConfig ile beraber tanımlanırlar ve useAppConfig fonksiyonu ile alınırlar.
ts
export default defineAppConfig({
title: "hi world",
theme: {
dark: false,
},
});

Default olarak app.vue dosyamız ana layout olarak davranır ve NuxtPage ile pages altındaki dosyaları dizin yapısına göre gösterir.Bunun yerine layouts mantığını kullanmak için
html
<template>
<NuxtLayout>
<NuxtPage />
</NuxtLayout>
</template>

default olarak layouts/default.vue kullanılır.Başka bir layout kullanmak için layoutumuzu oluşturduktan sonra
html
<template>
<NuxtLayout  name="custom">
<NuxtPage />
</NuxtLayout>
</template>

```ts
definePageMeta({
  layout: "test",
});
```

kullanılabilir

Assets: Kullanılan statik dosyalar için Nuxt 2> farklı directory sunar.  
_assets_: Kullanılan bundlera(Vite,Webpack) bağlı olarak minification işlemine sokmak istenilen dosyalar tutulur.(Fonts,CSS files vice versa). "~/assets/" pathi '/assets' aliası olarak kullanılır.  
_public_: Herhangi bir işlem uygulanmaması gereken dosyalar için kullanılır. '/' pathi '/public' aliası olarak kullanılır.

SCSS-SASS: SCSS dosyalarını eklemek için nuxt.config.ts teki css:[] kullanılırken partial files için vite altındaki özellikler ile eklememiz gerekir.  
npm i sass

```ts
export default defineNuxtConfig({
  css: ["~/assets/main.scss"], // scss files
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/_colors.scss" as *;', // partial scss files like colors
        },
      },
    },
  },
});
```

ROUTING

- Vite ile proje yaparken (vite-plugin-pages)[vite-plugin-pages] kullandıysanız benzer olduklarını söyleyebiliriz.(vite-plugin-pages)[vite-plugin-pages] Nuxt routingten esinlenerek yapılmıştır.
- File-based-routing denilen dosya dizin yapısı üzerinden routerlar otomatik olarak vue-router ile oluşur.Aşağıdaki örneklere bakabiliriz.

| File                 | Path           |
| -------------------- | -------------- |
| /pages/index.vue     | /              |
| /pages/[id].vue      | /pages/:id.vue |
| /pages/[...slug].vue | 404 page       |

- Page transition özelliğinden yaralanmak için tüm sayfaların root elementi olmalıdır.
- Bir sayfaya meta özellik eklemek için
  ts
  definePageMeta({
  permissions: ["write"],
  });

- Nuxt in kullandığı bazı meta özellikler vardır.Hepsine değil sadece 3 tanesine bakalım:

1. keepalive: Vue KeepAlive built-in componenti otomatik olarak sayfada kullanılır.Ayrıca <NextPage keepAlive/> şeklinde de kullanılabilir.
2. layout: kullanılacak layout ismi yazılır.
3. middleware: Sayfa yüklenmeden önce kullanılacak middlewareler tanımlanır.

- Meta özellikleri tanımlarken TypeScript desteğiyle beraber işlemlerimizi yapmak için:

```ts
//index.d.ts
declare module "#app" {
  interface PageMeta {
    permissions?: string[];
  }
}

export {};
```

- Sayfa geçişlerini yapmak için NuxtLink componenti kullanılır.replace gibi vue-router özelliklerini destekler.
- Programmatic navigation için ise navigateTo kullanılır ancak await ile kullanılması veya return değeri olarak eklenmesi gerekir.
- Client side only sayfalar yapmak için .client.vue ,server side only sayfalar yapmak için .server.vue suffixi eklenir.

[vite-plugin-pages]: https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&ved=2ahUKEwjHtNjc6vuEAxVFOXoKHV6fAkwQFnoECAYQAQ&url=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fvite-plugin-pages&usg=AOvVaw1fXxfkqfMDAFIZpj_79xgL&opi=89978449

## Composables

Basically Nuxt just add auto import feature to /composables directory.To learn well composables please click here to read [Vue composables](https://vuejs.org/guide/reusability/composables).
Nuxt does not import automatically nested composables,To do that we should configure nuxt.config.ts like below:

```ts
export default defineNuxtConfig({
  imports: {
    dirs: ["composables/**"],
  },
});
```

Be aware that useNuxtApp or other composable functions can be used in a composable.

## I18N

Vue I18n üzerine kurulmuştur ve ssr desteğini vermektedir.

```bash
npm install -D @nuxtjs/i18n
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@nuxtjs/i18n"],
  i18n: {
    strategy: "prefix_and_default",
    customRoutes: "config",
    pages: {
      test: {
        tr: "/deneme",
        en: "/test",
      },
    },
    vueI18n: "./i18n.config.ts",
    locales: ["tr", "en"],
    defaultLocale: "tr",
  },
});

// i18n
export default defineI18nConfig(() => ({
  legacy: false,
  locale: "tr",
  fallbackLocale: "tr",
  messages: {
    en: {
      welcome: "Welcome",
    },
    tr: {
      welcome: "Hoşgeldiniz",
    },
  },
  silentFallbackWarn: true,
  silentTranslationWarn: true,
  fallbackWarn: false,
  missingWarn: false,
}));
```

_strategy_:

1. _prefix_: her routun önüne dil prefixini ekler.
2. _non-prefix_: hiçbir dile prefix eklemez.
3. _prefix_and_default_ : tüm dillere prefix ekler.Ayrıca default sayfası için prefixsiz routelarıda tanımlar.
4. _prefix_except_default_ : ana dil harici tüm dillere prefix ekler.  
   _customRoutes_ :can be "config" or "pages".Dil bazlı yönlendirmenin nerede tanımlanacağını belirtir.Burada config dedikten sonra config dosyasında tanımladık  
   _pages_: dil bazlı yönlendirmelerin tanımlarını belirtir.Mesela burda test.vue dosyası için /en/test veya tr için /deneme olur.  
   _vueI18n_: config file of vue-i18n  
   _locales_ : routing için kullanılacak dilleri tanımlar  
   _defaultLocale_ : default dilimizi tanımlar böylece.prefix_and_default seçeneği için prefixin eklenmeyeceği dili seçer

Also allow declaring locale paths in components:for this>

1. nuxt.config.ts>i18n.customRoutes="page"

```ts
defineI18nRoute({
  paths: {
    tr: "/deneme",
    en: "/test",
  },
});
```

When using locale routes we should use NuxtLinkLocale instead of NuxtLink and localePath instead of navigateTo.

_Browser language detection_:  
Default olarak detectBrowserLanguage açıktır ve cookilerde i18n_redirected keyi üzerinde aktif dili tutar.Aşağıdaki configurasyon default olandır.

```ts
export default defineNuxtConfig({
  i18n: {
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root", // recommended
    },
  },
});
```

_useCookie_: cookie kullanımını kapatmak için kullanılabilir  
_cookieKey_: cookide kullanılan keyi değiştirmek için kullanılır.Default olarak i18n_redirected keyi kullanılır.

_Lazy-loading_: Kullanıcının seçtiği dil dosyalarını eklemek için lazy:true seçeneği kullanılır.Bu durumda dil çevirileri dosyalarda tutularak gerekli dosya import edilir.Dil dosyası .ts,json veya .js uzantılı olabilir.

```ts
{ i18n:{
locales: [
{ code: "tr", files: ["tr/tr.json"] },
{ code: "en", files: ["en/en.json"] },
],
lazy:true,
langDir: "lang"
}}
```

_Cache_ default olarak fonksiyon olarak tanımlanmamış tüm çeviriler kullanıldıkları anda cachlenir.Cache durumunu belirlemek için her locale için cache değeri düzenlenebilir.

```ts
{ i18n:{
locales: [
{ code: "tr", files: [{ path: "tr/tr.json", cache: false }] },
{ code: "en", files: [{ path: "en/en.json", cache: true }] },
],
lazy:true,
langDir: "lang"
}}
```

_Switching Locale_:Vue-i18n locale değerini direk değiştirmek yerine @nuxtjs/i18 useSwitchLocalePath fonksiyonu ile local değiştirilmelidir.

```ts
<template>
<NuxtLink
class="dropdown-item cursor-pointer"
v-for="locale in locales"
:key="locale.code"
:to="switchLocalePath(locale.code)"

>

    {{ locale.code }}

  </NuxtLink>
</template>

<script setup>
const {  locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();
</script>
```

_locales_ : nuxt.config.ts dosyasındaki locales değeridir.
_PerComponent translations_: Bileşen özelinde local translationlarda tanımlanabilir aşağıdaki gibi.

```ts
<!-- /test.vue -->
<i18n lang="yaml">
en:
  hello: "hello world!"
tr:
  hello: "こんにちは、世界!"
</i18n>
```

## Transitions

Page ve layouts transitionları eklenerek geçişlerde animasyon sağlanabilir.

```ts
//nuxt.config.ts
export default defineNuxtConfig({
  css: ["@unocss/reset/tailwind.css", "~/assets/scss/main.scss"],
  app: {
    pageTransition: { name: "page", mode: "default" },
  },
});
```

```scss
//assets/scss/main.scss
.page-enter-active,
.page-leave-active {
  transition: all 0.4s ease-out;
}

.page-enter-to,
.page-leave-from {
  transform: 0;
  opacity: 1;
}

.page-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.page-leave-to {
  transform: translateX(100%);
  opacity: 1;
  position: absolute;
  width: 100%;
  height: 100%;
}
```

PageTransitions and LayoutTransitions takes all features of Transition built-in component.Thus They also allow to declare other options like mode,duration and hooks.

```ts
export default defineNuxtConfig({
  css: ["@unocss/reset/tailwind.css", "~/assets/scss/main.scss"],
  app: {
    pageTransition: { name: "page", mode: "default", onBeforeEnter(elem) {} },
  },
});
```

Transitions can be declared as component-level like below code:

```ts
//about.vue
definePageMeta({
  pageTransition: false,
  layoutTransition: false,
});
```

## Server

[Nitro][nitro] comes into the scene for FullStack Applications in Nuxts.Nitro is a next generation server toolkil.It created for Nuxt originally but nowadays it is a part of [UnJs][unjs].Nitro uses [h3][h3](H(TTP))(Minimal HTTP Framework) and allow all feature of it.

[h3][h3] uses lazy-loading which used to load a file when requested.With this approach cold start reduces from ~300ms to ~2ms :)

Also [nitro][nitro] build the server files with [rollup][rollup] and [vercel/nft][vercel/nft] and reduce size of project outstandingly.

The last think before delve into the Nitro is When send a request on the server,the request will executed directly instead of sending http request!.That's one of the important reason why we should use Nitro!.

### Routes

/api prefix automaticcaly added the files which are inside of /api directory.To do not use prefix,/routes directory can be used.
Routes can directly return JSON ,html or can send data via eevent.node.res.end().

Routes method are declared as suffix with specified type.For example test.put.ts will be > PUT /api/test
Also index.[method].ts can be useful to add all related routes in a directory like below code

```bash
user
  index.get.ts
  index.put.ts
  index.post.ts
  index.delete.ts
```

also a lot of handy functions can be used like below:

```ts
getHeader(event, "authorization"), // returns req.headers.authorization
  getRouterParam(event, "id"), // returns req.params.id
  getQuery(event), // returns req.query
  getRequestHeader(event, "authorization"), // returns req.headers.authorization
  getRequestURL(event), // returns req.url
  getRequestProtocol(event), // returns protocol
  getRequestIP(event); // returns ip
```

readValidatedBody and getValidatedQuery can be used to validate body and query with a schema validator like zod.Zod also works well with typescript and infer types.

```ts
//api/user/index.post.ts
import { z } from "zod";

const userSchema = z.object({
  password: z.string(),
  email: z.string().email(),
});

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    userSchema.safeParse(body)
  );

  if (!result.success) {
    throw createError({
      status: 400,
      statusMessage: result.error.message,
    });
  }

  return result.data;
});
```

By default all successfull routes return status code as 200 and unseccessfull routes return 500 status code.
To change status code `setResponseStatus` is used. `setResponseStatus(event, 201);`

As we mentioned before, runtimeConfig is used to securely declare and use environments.

**Cache all route** : 404 page can be used with `[...slug].ts` like below

```ts
// api/[...slug].ts
export default defineEventHandler(
  async (event) => getRouterParam(event, "slug") + " not found"
);
```

**MUltiple routes in a file** :

There is a handy way yo declare multiple routes in a file.

```ts
const router = createRouter();

router.post(
  "/hi",
  defineEventHandler(async (event) => "hi from post user")
);

router.get(
  "/hi",
  defineEventHandler(async (event) => "hi from get user")
);

export default useBase("/api/test", router.handler);
```

## Middleware

All files inside of middleware directory run for each request.They should do not return anything,Middlewares are used to extend the request or throw errors.

## Plugins // to do

## Utils

all of h3 features can be used with Nuxt,for example below code will coverage all of the handlers.

```ts
import type { EventHandler, EventHandlerRequest } from "h3";

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    try {
      // do something before the route handler
      console.log("hi world");

      const response = await handler(event);
      // do something after the route handler
      return { response };
    } catch (err) {
      // Error handling
      return { err };
    }
  });
```

### Nitro storage:

h3 allow us to use storages like mongodb or redis easily with a storage layer.There are two ways to add a storage to the project

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    storage: {
      redis: {
        driver: "redis",
        port: 6379,
        host: "localhost",
        password: "my_password",
        db: 0,
      },
    },
  },
});
```

```ts
// middleware/auth.ts
export default defineEventHandler({
  handler: async (event) => {
    if (event.path.startsWith("/api/user")) {
      const token = getRequestHeader(event, "Authorization");

      if (!token)
        throw createError({
          status: 403,
          message: "Forbidden resource",
        });

      const user = await useStorage("redis").getItem<string>(token);
      if (!user) {
        await useStorage("redis").setItem(token, {
          id: 11,
        });
      }

      event.context.user = user;
    }
  },
});
```

the other way is:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    redis: {
      port: 6379,
      host: "localhost",
      password: "my_password",
      db: 0,
    },
  },
});

// server/plugins/storage.ts

import redisDriver from "unstorage/drivers/redis";

export default defineNitroPlugin(() => {
  const storage = useStorage();
  const runtimeConfig = useRuntimeConfig();
  const { password, db, port, host } = runtimeConfig.redis;

  const driver = redisDriver({
    base: "redis",
    host,
    db,
    port,
    password,
  });

  storage.mount("redis", driver);
});
```

[nitro]: https://nitro.unjs.io/
[rollup]: https://rollupjs.org/
[vercel/nft]: https://github.com/vercel/nft
[h3]: https://h3.unjs.io/
[unjs]: https://unjs.io/
[vue-composables]: https://vuejs.org/guide/reusability/composables
