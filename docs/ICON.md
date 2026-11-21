# Icons

The logo is a shelf holding three items: blue for links, amber for text snippets and white for
anything else. Those are the same colors the app uses for item types.

## Sources

| File | What it is |
| --- | --- |
| `electron/assets/logo.svg` | App icon source on the 1024px macOS grid (824px tile, 185px corner radius) |
| `electron/assets/trayTemplate.svg` | Menu bar mark on a 22px grid, black on transparent |

## Generated files

Run this after editing either SVG (macOS only):

```bash
npm run icons
```

It writes:

- `electron/assets/icon.png`: the 1024px master, also used as the Dock icon in development
- `electron/assets/icon.icns`: every macOS size from 16px to 1024px, used by electron-builder
- `electron/assets/iconTemplate.png` and `iconTemplate@2x.png`: the 22px and 44px menu bar template images

The script (`scripts/build-icons.js`) rasterizes with Electron, resizes with `sips` and packs the
`.icns` file with `iconutil`, so it needs no extra dependencies.
