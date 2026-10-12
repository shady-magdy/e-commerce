'use strict';

require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') });
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createRequire } = require('node:module');
const { createServer } = require('node:http');
const { createApp } = require('./app');
const { connectDatabase } = require('./config/db');

async function main() {
  const app = createApp();
  const server = createServer(app);
  const port = Number(process.env.PORT) || 3000;
  const embeddedPreview = process.env.PREVIEW_EMBED === 'true';
  const hmrClientPort = embeddedPreview ? (Number(process.env.PREVIEW_HMR_CLIENT_PORT) || 443) : port;
  if (process.env.NODE_ENV !== 'production') {
    const clientRoot = path.resolve(__dirname, '../client');
    const clientRequire = createRequire(path.join(clientRoot, 'package.json'));
    const viteEntry = clientRequire.resolve('vite');
    const viteEntryUrl = pathToFileURL(viteEntry).href;
    const { createServer: createViteServer } = await import(viteEntryUrl);
    const vite = await createViteServer({
      root: clientRoot,
      configFile: path.join(clientRoot, 'vite.config.js'),
      server: {
        middlewareMode: true,
        ws: { server },
        hmr: { clientPort: hmrClientPort, ...(embeddedPreview ? { protocol: 'wss' } : {}) },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use((error, req, res, next) => { vite.ssrFixStacktrace(error); next(error); });
  }
  server.listen(port, '0.0.0.0', () => console.log(`Atelier Store listening on port ${port}.`));
  connectDatabase().catch(error => console.error(`MongoDB unavailable: ${error.message}`));
  const close = () => { server.close(); process.exit(0); };
  process.on('SIGINT', close);
  process.on('SIGTERM', close);
}
main().catch(error => { console.error(error); process.exit(1); });
