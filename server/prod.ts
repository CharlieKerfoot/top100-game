import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { Server } from 'socket.io';
import { handler } from '../build/handler.js';
import { setupSocketServer } from './socket.ts';
import { handleDailyRequest } from './daily.ts';

const PORT = parseInt(process.env.PORT || '3000', 10);

const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const handled = await handleDailyRequest(req, res);
  if (!handled) {
    handler(req, res);
  }
});
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

setupSocketServer(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
