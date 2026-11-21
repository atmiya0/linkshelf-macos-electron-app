/**
 * Renders the Linkshelf icons from their SVG sources (macOS only).
 *
 *   npm run icons
 *
 * electron/assets/logo.svg          -> icon.png (1024) + icon.icns (all macOS sizes)
 * electron/assets/trayTemplate.svg  -> iconTemplate.png (22) + iconTemplate@2x.png (44)
 *
 * Electron rasterizes the SVG at a large size, then macOS `sips` downsamples and
 * `iconutil` packs the .icns. No extra dependencies needed.
 */
const { app, BrowserWindow } = require('electron');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const assets = path.join(__dirname, '..', 'electron', 'assets');
const RENDER_SIZE = 1024;

async function rasterize(svgPath, outPng) {
  const svg = fs.readFileSync(svgPath, 'utf8')
    .replace(/<svg([^>]*?)\swidth="[^"]*"/, '<svg$1')
    .replace(/<svg([^>]*?)\sheight="[^"]*"/, '<svg$1')
    .replace('<svg', '<svg width="100%" height="100%"');

  const html = `<!doctype html><html><head><style>
    html,body{margin:0;width:100%;height:100%;background:transparent;overflow:hidden}
    svg{display:block}
  </style></head><body>${svg}</body></html>`;

  const win = new BrowserWindow({
    width: RENDER_SIZE,
    height: RENDER_SIZE,
    useContentSize: true,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: { offscreen: true },
  });
  const htmlPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'linkshelf-svg-')), 'render.html');
  fs.writeFileSync(htmlPath, html);
  const loaded = new Promise((resolve) => win.webContents.once('did-finish-load', resolve));
  win.loadFile(htmlPath).catch(() => { /* offscreen loads can report a spurious stop; did-finish-load decides */ });
  await Promise.race([
    loaded,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Timed out rendering ${svgPath}`)), 10000)),
  ]);
  await new Promise((resolve) => setTimeout(resolve, 300));
  const image = await win.webContents.capturePage();
  const resized = image.getSize().width === RENDER_SIZE
    ? image
    : image.resize({ width: RENDER_SIZE, height: RENDER_SIZE, quality: 'best' });
  fs.writeFileSync(outPng, resized.toPNG());
  win.destroy();
}

function resize(src, size, out) {
  execFileSync('sips', ['-z', String(size), String(size), src, '--out', out], { stdio: 'ignore' });
}

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'linkshelf-icons-'));

  // App icon
  const master = path.join(assets, 'icon.png');
  await rasterize(path.join(assets, 'logo.svg'), master);

  const iconset = path.join(tmp, 'icon.iconset');
  fs.mkdirSync(iconset);
  for (const base of [16, 32, 128, 256, 512]) {
    resize(master, base, path.join(iconset, `icon_${base}x${base}.png`));
    resize(master, base * 2, path.join(iconset, `icon_${base}x${base}@2x.png`));
  }
  execFileSync('iconutil', ['-c', 'icns', iconset, '-o', path.join(assets, 'icon.icns')]);

  // Menu bar template icon
  const trayMaster = path.join(tmp, 'tray.png');
  await rasterize(path.join(assets, 'trayTemplate.svg'), trayMaster);
  resize(trayMaster, 22, path.join(assets, 'iconTemplate.png'));
  resize(trayMaster, 44, path.join(assets, 'iconTemplate@2x.png'));

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('Icons written to electron/assets');
}

// Each render opens and closes its own window; don't let Electron quit in between.
app.on('window-all-closed', () => {});
app.dock?.hide();

app.whenReady()
  .then(main)
  .then(() => app.quit())
  .catch((error) => {
    console.error(error);
    app.exit(1);
  });
