import 'dotenv/config';
import { startServer, stopServer } from './server';

const PORT = Number(process.env.PORT || 3000);

startServer(PORT).catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});

process.on('SIGINT', async () => { await stopServer(); process.exit(0); });
process.on('SIGTERM', async () => { await stopServer(); process.exit(0); });

process.on('unhandledRejection', async (reason) => {
  console.error('Unhandled Rejection:', reason);
  await stopServer();
  process.exit(1);
});
process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err);
  await stopServer();
  process.exit(1);
});
