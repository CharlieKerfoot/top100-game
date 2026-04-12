import { Server } from 'socket.io';
import { createServer } from 'http';
import { setupSocketServer } from './socket.ts';
import { handleDailyRequest } from './daily.ts';

const PORT = 3001;

const httpServer = createServer(async (req, res) => {
  const handled = await handleDailyRequest(req, res);
  if (!handled) {
    res.writeHead(404);
    res.end();
  }
});
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

setupSocketServer(io);

httpServer.listen(PORT, () => {
  console.log(`Game server running on http://localhost:${PORT}`);
});
