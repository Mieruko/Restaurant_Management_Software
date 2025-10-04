require('dotenv').config();
const http = require('http');
const app = require('./app');

const PORT = normalizePort(process.env.PORT || '3000');

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (pid=${process.pid})`);
});

server.on('error', onError);
server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  console.log(`Listening on ${bind}`);
});

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (Number.isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') throw error;
  const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
}

// Graceful shutdown & process handlers
// During debugging we may want to prevent stray SIGINT from immediately stopping the process.
// Set DISABLE_GRACEFUL_SHUTDOWN=true in the environment to skip registering these handlers.
if (!process.env.DISABLE_GRACEFUL_SHUTDOWN || process.env.DISABLE_GRACEFUL_SHUTDOWN === 'false') {
  process.on('SIGINT', () => {
    console.log('SIGINT received — shutting down gracefully');
    shutdown();
  });
  process.on('SIGTERM', () => {
    console.log('SIGTERM received — shutting down gracefully');
    shutdown();
  });
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    shutdown(1);
  });
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    shutdown(1);
  });
} else {
  console.log('DISABLE_GRACEFUL_SHUTDOWN=true — skipping process signal handlers for debugging');
}

function shutdown(exitCode = 0) {
  server.close(() => {
    console.log('Closed remaining connections');
    process.exit(exitCode);
  });
  setTimeout(() => {
    console.error('Forcing shutdown');
    process.exit(1);
  }, 10000);
}