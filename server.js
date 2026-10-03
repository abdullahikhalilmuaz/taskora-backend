require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./src/app");
const connectDB = require("./src/config/database");
const socketHandler = require("./src/sockets/socketHandler");

const PORT = process.env.PORT || 5000;

const ALLOWED = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://taskora-vc0b.onrender.com",
  // add your custom domain or new render URL here when you have it
];

const corsOrigin = (origin, cb) => {
  if (!origin) return cb(null, true); // mobile apps, curl, Postman
  if (ALLOWED.includes(origin)) return cb(null, true);
  return cb(null, true); // fallback: allow all (dev-friendly)
};

const start = async () => {
  await connectDB();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    },
  });

  app.set("io", io);
  socketHandler(io);

  server.listen(PORT, () => {
    console.log("====================================================");
    console.log(" Smart Task Management - Backend");
    console.log(" Server running on port " + PORT);
    console.log(" Socket.io ready");
    console.log("====================================================");
  });
};

start();
