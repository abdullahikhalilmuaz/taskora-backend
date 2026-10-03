require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const socketHandler = require('./src/sockets/socketHandler');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  app.set('io', io);
  socketHandler(io);

  server.listen(PORT, () => {
    console.log('====================================================');
    console.log(' Smart Task Management - Backend');
    console.log(' Server running on port ' + PORT);
    console.log(' Socket.io ready');
    console.log('====================================================');
  });
};

start();
