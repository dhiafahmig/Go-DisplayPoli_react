const { createProxyMiddleware } = require('http-proxy-middleware');

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
      }
    })
  );
  
  // Proxy WebSocket requests dengan konfigurasi yang lebih sederhana
  // Hapus header yang berlebihan dan biarkan koneksi upgrade berjalan normal
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
        // Jangan kirim respons untuk koneksi WebSocket yang gagal
        if (res && !req.url.includes('/ws/') && typeof res.writeHead === 'function') {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Proxy Connection Error', details: err.message }));
        }
      },
      onProxyReqWs: (proxyReq, req, socket, options, head) => {
        console.log(`WebSocket connection request: ${req.url}`);
      }
    })
  );
  
  // Proxy for static assets dari server React development
  app.use(
    '/assets',
    createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyRes: (proxyRes, req, res) => {
        // Log response untuk debugging
        console.log(`Asset served from React dev server: ${req.url} (${proxyRes.statusCode})`);
        
        // Tambahkan CORS headers
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
        proxyRes.headers['Cache-Control'] = 'public, max-age=3600';
      },
      // Handle 404 dengan fallback ke backend
      onProxyRes: function(proxyRes, req, res) {
        if (proxyRes.statusCode === 404) {
          console.log(`Asset not found in React dev server, trying backend: ${req.url}`);
          // Redirect ke backend untuk asset yang tidak ditemukan
          const backendReq = createProxyMiddleware({
            target: 'http://localhost:8080',
            changeOrigin: true
          })(req, res);
        }
      }
    })
  );
}; 