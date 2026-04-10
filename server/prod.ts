import { createServer } from 'http';
import { Server } from 'socket.io';
import { handler } from '../build/handler.js';
import { setupSocketServer } from './socket.ts';

const PORT = parseInt(process.env.PORT || '3000', 10);

const httpServer = createServer(handler);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

setupSocketServer(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
