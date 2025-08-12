const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const app = express();


// Proxy WebSocket
app.use('/ws', createProxyMiddleware({
  target: 'http://localhost:4000',
  ws: true,
  changeOrigin: true,
  pathRewrite: { '^/ws': '/ws' }
}));

// Proxy API REST
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:4000',
  changeOrigin: true,
  pathRewrite: { '^/api': '/api' }
}));

// Proxy para el frontend (Next.js)
app.use('/', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  xfwd: false,
  hostRewrite: 'localhost:9002',
  protocolRewrite: 'http',
  cookieDomainRewrite: 'localhost',
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.removeHeader('x-forwarded-host');
    proxyReq.removeHeader('origin');
    proxyReq.setHeader('origin', 'http://localhost:9002');
    proxyReq.setHeader('host', 'localhost:9002');
  }
}));


app.listen(9002, () => {
  console.log('Proxy escuchando en http://localhost:9002');
});