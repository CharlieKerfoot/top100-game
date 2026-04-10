import { Server } from 'socket.io';
import { createServer } from 'http';
import { setupSocketServer } from './socket.ts';

const PORT = 3001;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

setupSocketServer(io);

httpServer.listen(PORT, () => {
  console.log(`Game server running on http://localhost:${PORT}`);
});
