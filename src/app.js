const express = require("express");
const cors = require("cors");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

const corsOptions = {
  origin: (origin, cb) => cb(null, true), // allow all origins, no crash on missing origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-user-email", "x-admin-email"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Smart Task Management API", status: "running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
