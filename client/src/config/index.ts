const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  SERVER_URL: import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3000',
  WS_URL: import.meta.env.VITE_WS_URL ?? 'http://localhost:3001',
  CLIENT_PORT: import.meta.env.VITE_CLIENT_PORT ?? '5173'
};

export default config;