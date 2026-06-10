import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Helper para preservar e encaminhar os cabeçalhos de proxy originais (Ngrok/IP local) para o backend
const configureProxyHeaders = (proxy) => {
  proxy.on('proxyReq', (proxyReq, req) => {
    let forwardedHost = req.headers['x-forwarded-host'];
    let forwardedProto = req.headers['x-forwarded-proto'];

    // Usa o Referer para capturar exatamente o domínio e protocolo que o usuário vê na barra de endereços
    const referer = req.headers.referer;
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        if (!refererUrl.host.includes('google.com')) {
          forwardedHost = refererUrl.host;
          forwardedProto = refererUrl.protocol.replace(':', '');
        }
      } catch (e) {
        // Ignora falhas de parse do referer
      }
    }

    // Fallbacks caso não consiga obter do referer
    if (!forwardedHost) {
      forwardedHost = req.headers.host;
    }
    if (!forwardedProto) {
      forwardedProto = req.socket?.encrypted ? 'https' : 'http';
    }

    if (forwardedHost) {
      proxyReq.setHeader('X-Forwarded-Host', forwardedHost);
    }
    if (forwardedProto) {
      proxyReq.setHeader('X-Forwarded-Proto', forwardedProto);
    }
  });
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: configureProxyHeaders
      },
      '/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: configureProxyHeaders
      },
      '/login/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: configureProxyHeaders
      },
    },
  },
})
