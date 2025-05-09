const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * CATATAN PENTING TENTANG ASSETS:
 * 
 * Untuk menghindari Gateway Timeout (504) error pada assets:
 * 1. Pindahkan semua aset yang digunakan dalam komponen ke dalam src/assets/
 * 2. Impor aset langsung dalam kode JavaScript/React
 * 3. Jangan menggunakan URL publik seperti /assets/images/file.png dalam komponen
 * 
 * Contoh benar:
 * - import gambarLogo from '../assets/images/logo.png';
 * - <img src={gambarLogo} alt="Logo" />
 * 
 * Untuk favicon dan manifest, tetap gunakan path relatif di index.html:
 * - <link rel="icon" href="./assets/images/rs.ico" />
 */

module.exports = function(app) {
  console.log('Setting up proxies for development server');
  
  // Proxy API requests
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      headers: {
        Connection: 'keep-alive'
      },
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying API request: ${req.method} ${req.url}`);
      },
      timeout: 60000,
      proxyTimeout: 60000
    })
  );
  
  // Proxy WebSocket requests dengan konfigurasi yang lebih sederhana
  app.use(
    '/ws',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      ws: true,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error('WebSocket proxy error:', err);
        if (res && !req.url.includes('/ws/') && typeof res.writeHead === 'function') {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Proxy Connection Error', details: err.message }));
        }
      },
      onProxyReqWs: (proxyReq, req, socket, options, head) => {
        console.log(`WebSocket connection request: ${req.url}`);
      },
      timeout: 60000,
      proxyTimeout: 60000
    })
  );
  
  // CARA BARU: Jangan gunakan proxy untuk static assets, biarkan mereka dilayani langsung
  // dari folder public oleh server development React
  console.log('Static assets will be served directly from the React development server');
}; 