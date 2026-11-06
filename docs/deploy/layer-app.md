# Deploying FeedLog under your own app (Nuxt layer)

FeedLog can run as a [Nuxt layer](https://nuxt.com/docs/4.x/guide/going-further/layers).
Your own small app sits on top of it and holds what is yours: the look, the
words, the icons and the Worker config. FeedLog itself stays unchanged, at a
commit you pin.

Use this when plain settings are not enough, for example for exact brand
colours, your own fonts or changed wording.

## Layout

```
acme-desk/
  package.json            { "name": "acme-desk", "private": true, "type": "module" }
  nuxt.config.ts          site name, your CSS file, the language list
  wrangler.toml           the full Worker config (name, route, bindings, vars)
  app/assets/brand.css    colours, fonts, corner sizes
  app/components/         components you replace, by name
  i18n/locales/en.json    the strings you change (en, zh)
  i18n/widget/de.json     the widget strings you change (de, es, fr, it, pt)
  public/                 logo.svg, favicon.ico, favicon.png, apple-touch-icon.png, og.png
  layers/feedlog/         this repository, at your pinned commit
```

`nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  site: { name: 'Acme Desk' },
  css: ['~/assets/brand.css'],
  i18n: { locales: [{ code: 'en', file: 'en.json' }, { code: 'zh', file: 'zh.json' }] },
})
```

Keep `layers/`, `node_modules`, `.nuxt/`, `.output/`, `.data/`, `.wrangler/` and
`eslint.config.mjs` out of git: the build creates them.

Nuxt finds `layers/feedlog` by itself. Start `wrangler.toml` from the one in
this repository and set your own values. Secrets stay Worker secrets
(`wrangler secret put`).

## Build and deploy

```bash
git clone <this repository> layers/feedlog
git -C layers/feedlog checkout <commit>
layers/feedlog/scripts/build-layer-app.sh
wrangler deploy --config .output/server/wrangler.json
```

The script installs FeedLog's dependencies, builds your app for Workers and
copies the database migrations into the output. Every key of your
`wrangler.toml` is in `.output/server/wrangler.json`.

## What you can change

| What | How |
|---|---|
| Colours | Set the theme variables in your CSS with three selectors, because FeedLog injects its own colours with two: `:root:root:not(.dark) { --background: #fffdf7; --border: #e6dcc8; }` changes the light theme and leaves the dark one whole. |
| Corner sizes | `:root { --theme-radius-sm: 2px; --theme-radius-md: 4px; --theme-radius-lg: 8px; --theme-radius-xl: 12px; }` |
| Fonts | `body, .font-body { font-family: 'Outfit', sans-serif; }` and `h1, h2, h3, h4, h5, h6, .font-heading { font-family: 'Fraunces', serif; }` |
| Any UI string | The same key in `i18n/locales/<lang>.json`. Your file holds only the keys you change. |
| Widget strings in de, es, fr, it, pt | The same key in `i18n/widget/<lang>.json`, for example `{ "widget": { "messageAI": "Acme assistant" } }` |
| Logo and icons | Files with the same names in `public/` |
| A component | A file with the same name in `app/components/` |
| Any element | Plain CSS in your CSS file |

## What you cannot change here

- Email text is server code. An organization with a name sends its mail under
  that name: set it in Settings → Workspace.
- Server routes and database migrations.

## When you move the pin

1. Compare `layers/feedlog/wrangler.toml` between the two commits and take over new bindings.
2. Check `layers/feedlog/server/db/migrations` for new files, and apply them (see [Cloudflare Workers](./cloudflare-workers.md)).
3. Build.
4. Check that your overrides are in the build: search `.output/public/_nuxt` for one string from each of your `i18n/locales` and `i18n/widget` files. A newer Nuxt can change how the app root is found, and a lost override gives no error.
5. Deploy.
