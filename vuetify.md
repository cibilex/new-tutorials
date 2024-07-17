-`import {createVuetify} from "vuetify` instead of `import vuetify from 'vuetify/dist/vuetify.js'`
- `vuetify/styles` just contains global styles like reset and utilities .Component styles are come with components.




## Default values:
```ts
import { VBtn } from "vuetify/components/VBtn";
import { VFooter } from "vuetify/components/VFooter";

export default createVuetify({
  defaults: {
    global: {
      ripple: false,
      variant: "outlined",
    },
    VBtn: {
      variant: "outlined",
      style: "color:red;",
      class: "bg-yellow", 
    },
    VFooter: {
      VBtn: {
        variant: "tonal", // when VBtn corresponding into VFooter
      },
    },
  },
});
```

Be aware that we can also determine class and style.class and style cannot be used in the global object, only in specific components.They don't override the attribe,they merge with them.

## Application layout
- `v-app-bar`: application header.   
- `v-footer`: footer
- `v-navigation-drawer`: navigation links
- `v-system-bar`: phone system bar
- `v-main`: this components takes all the unused place and  our pages should be put inside it.

They takes  place by their declaration order but we can change their order dynamically by `order` property.By default all component's order property is 0,therefore -1 will place a component as a first component.


```html

<template>
  <v-app ref="app" class="rounded rounded-md">
    <v-navigation-drawer color="grey-darken-2" name="drawer" permanent>
      <div class="d-flex justify-center align-center h-100">
        <child>
          <v-btn>Get data</v-btn>
        </child>
      </div>
    </v-navigation-drawer>

    <v-navigation-drawer location="right" color="grey-darken-2" permanent>
      <div class="d-flex justify-center align-center h-100">
        <child>
          <v-btn>Get data</v-btn>
        </child>
      </div>
    </v-navigation-drawer>

    <v-app-bar color="grey-lighten-2" name="app-bar">
      <child>
        <v-btn class="mx-auto">Get data</v-btn>
      </child>
    </v-app-bar>

    <v-main
      class="d-flex align-center justify-center"
      style="min-height: 300px"
    >
      Main Content
    </v-main>

    <v-footer name="footer" app>
      <v-btn class="mx-auto" variant="text"> Get data </v-btn>
    </v-footer>
  </v-app>
</template>
```



### Blueprints
Blueprints are a collection of default values for components like colors,language and so forth.There are 3 blueprints currently which are `md1`,`md2`,`md3`.
```ts
import { md1 } from 'vuetify/blueprints'

export default createVuetify({
  blueprint: md1,
})
```

##  Dates
Vuetify provides `useDate` composable function to allow to modify and format date.
```ts
import { useDate } from "vuetify";
const date = useDate();
```
`format(date,formatStr)`: [formatStr](https://vuetifyjs.com/en/features/dates/#format-options) can be `fullTime24h`,`hours24h`,`hours12h`,`dayOfMonth`
`addMinutes(date,count)`,`getHours(date)`,`isEqual(date1,date2)`,`isValid(date)`

! luxon implementation


## Display
vuetify provides `useDevice` composable function to allow to get information about device.
```ts
import { useDisplay } from "vuetify";
const device = useDisplay();
```

Here is a list of infos we can get:
- `height` - `width`: innerHeight and innerWidth
- platform: example res:
```json
{
    "android": false,
    "ios": false,
    "cordova": false,
    "electron": false,
    "chrome": true,
    "edge": false,
    "firefox": false,
    "opera": false,
    "win": false,
    "mac": true,
    "linux": false,
    "touch": false,
    "ssr": false
}
```
- name : current breakpoint name
- mobile: true if screen with < mobileBreakpoint
- mobileBreakpoint: 'lg' as default.
This composable also gives lots of more information about current screen .Click [here](https://vuetifyjs.com/en/features/display-and-platform/#interface) to see more.

- To modify display configuration:
```ts
export default createVuetify({
  display: {
    mobileBreakpoint: "sm",
    thresholds: {
      xs: 0,
      sm: 340,
      md: 540,
      lg: 800,
      xl: 1280,
    },
  },
});
```
  

## I18N
`npm i vue-i18n @intlify/unplugin-vue-i18n`


```ts
// plugins/i18n.ts
import { createI18n } from "vue-i18n";
import virtualMessages from "@intlify/unplugin-vue-i18n/messages";
import { tr, en } from "vuetify/locale";

const messages = {
  tr: {
    ...virtualMessages!.tr,
    $vuetify: {
      ...tr,
      open: "Aç",
      datePicker: {
        title: "Tarih seçiniz",
      },
    },
  },
  en: {
    ...virtualMessages!.en,
    $vuetify: {
      ...en,
    },
  },
};

export const i18n = createI18n({
  legacy: false,
  locale: "tr",
  fallbackLocale: "tr",
  messages,
  silentTranslationWarn: true,
  silentFallbackWarn: true,
  fallbackWarn: false,
  missingWarn: false,
});
```

```ts
//plugins/vuetify.ts
import { createVuetify } from "vuetify";
import { useI18n } from "vue-i18n";
import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n";
import { i18n } from "./i18n";

export const vuetify = createVuetify({
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
  },
});
```





```ts
//plugins/indes.ts
import { vuetify } from "./vuetify";
import { i18n } from "./i18n";
import type { App } from "vue";

export function registerPlugins(app: App) {
  app.use(vuetify).use(i18n);
}
```

- app.vue kısmında local mesajlar tanımlandıktan sonra dili switch etmemize rağmen global 
dosyaların dilleri çalışmıyor.githuba issues olarak yaz> online ideler ile.



## GoTo
useGoTo composable function allow to scroll programmatically.
```ts
import { useGoTo } from "vuetify";

const goTo = useGoTo(); // goTo(target,opts)
```
- target can be number(refers to pixels),querySelector.
here are options:
- offset,duration,easing


## Theme

```html
<template>
  <v-btn @click="toggleTheme">toggle theme</v-btn>

  hi world
  <v-theme-provider theme="light">
    <v-btn>hi world</v-btn>
  </v-theme-provider>
</template>

<script setup lang="ts">
import { useTheme } from "vuetify";

const theme = useTheme();

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? "light" : "dark";
}
</script>

```


## SASS variables
```scss
//  styles/main.scss
@use 'vuetify' with (
  $reset:false
);
```

```ts
// plugins/vuetify.ts
- import 'vuetify/styles'
+ import '@/styles/main.scss'
```


## CSS reset
Vuetify uses `ress` which is built in normalize.css.
to disable it:
```scss
@use 'vuetify' with (
  $reset:false
);
```

## Transitions
Most components can take transition prop,also vuetify provides transition as outer component.
```html
  <v-menu transition="fab-transition">
    <template v-slot:activator="{ props }">
      <v-btn color="primary" dark v-bind="props"> Fab Transition </v-btn>
    </template>
    <v-list>
      <v-list-item v-for="n in 5" :key="n">
        <v-list-item-title v-text="'Item ' + n"></v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
```
```html
<v-expand-transition>
  <v-card
    v-show="expand"
    class="mx-auto bg-secondary"
    height="100"
    width="100"
  ></v-card>
</v-expand-transition>
```


## Colors
Vuetify comes with these colors which size around 30kb.To disable color pack feature:
```scss
@use 'vuetify' with (
  $color-pack: false
);
```


## Components
- **[v-app](https://vuetifyjs.com/en/components/application/#api)**: primary content of an application. 
    1.***full-height***: boolean.
- **[v-main](https://vuetifyjs.com/en/components/application/#api)**: it container of our content.It takes all blank place and fill the our content.`scrollable`,`width`,`height`,`min-height`


1. [a11y](https://vuetifyjs.com/en/features/accessibility/)
2. [blurprints](https://vuetifyjs.com/en/features/blueprints/)
3. material design 1-2-3 differences
4. [dates](https://vuetifyjs.com/en/features/dates/)
5. [icons](https://vuetifyjs.com/en/features/icon-fonts/#mdi-js-svg)
6. [sass](https://vuetifyjs.com/en/features/sass-variables/#disabling-color-packs) 
  - app.vue kısmında local mesajlar tanımlandıktan sonra dili switch etmemize rağmen global 
dosyaların dilleri çalışmıyor.githuba issues olarak yaz> online ideler ile.



