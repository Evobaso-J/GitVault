# Step 3: Update `nuxt.config.ts`

## 3.1 Remove `srcDir`

Delete the `srcDir: 'src/'` line — `app/` is the Nuxt 4 default after the directory rename.

## 3.2 Set `compatibilityDate`

```ts
compatibilityDate: '2026-02-21',
```

## 3.3 Add `css` entry

```ts
css: ['~/assets/css/main.css'],
```

## 3.4 Update `modules` list

```ts
modules: [
  '@nuxt/eslint',
  '@nuxt/ui',
  '@nuxtjs/i18n',
  '@nuxt/image',
  'nuxt-auth-utils',
  '@nuxt/test-utils/module',
],
```

## 3.5 Inline i18n config

Replace any external i18n config reference with:

```ts
i18n: {
  locales: [
    { code: 'en', language: 'en-US' },
  ],
  defaultLocale: 'en',
},
```

## 3.6 Keep `serverDir` and `ssr` settings

```ts
serverDir: 'server/',
ssr: false,
```

## 3.7 Final shape reference

```ts
export default defineNuxtConfig({
  compatibilityDate: '2026-02-21',

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxt/image',
    'nuxt-auth-utils',
    '@nuxt/test-utils/module',
  ],

  css: ['~/assets/css/main.css'],

  devtools: { enabled: true },

  typescript: {
    typeCheck: true,
  },

  i18n: {
    locales: [
      { code: 'en', language: 'en-US' },
    ],
    defaultLocale: 'en',
  },

  eslint: {
    // config here
  },

  serverDir: 'server/',
  ssr: false,

  runtimeConfig: {
    public: {
      ghDefaultBranch: 'main',
    },
    oauth: {
      github: {
        clientId: '',
        clientSecret: '',
      },
    },
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})
```
