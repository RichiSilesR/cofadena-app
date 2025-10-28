const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const app = express();


// Proxy WebSocket
app.use('/ws', createProxyMiddleware({
  target: 'http://127.0.0.1:1880',
  ws: true,
  changeOrigin: true
}));

// Proxy API REST
app.use('/api', createProxyMiddleware({
  target: 'http://127.0.0.1:1880',
  changeOrigin: true
}));



app.listen(9002, () => {
  console.log('Proxy escuchando en http://localhost:9002');
});