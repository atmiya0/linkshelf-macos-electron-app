import React from 'react';
import ReactDOM from 'react-dom/client';
import 'allo-font/allo.css';
import App from './App';

// The Mac app window has native translucent material behind the page (see electron/main.ts).
// Mark it before the first render so the window never flashes a solid background.
const isMacElectron =
  typeof (window as Window & { require?: unknown }).require === 'function' && /Mac/.test(navigator.userAgent);
if (isMacElectron) {
  document.documentElement.dataset.vibrancy = 'true';
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
