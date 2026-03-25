require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const PORT = 3000;
const HOST = "0.0.0.0";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://10.0.2.2:3000", // Android emulator
      "exp://localhost:19000", // Expo development
      "exp://192.168.1.11:19000", // Expo on network
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());

const authRoutes = require("./routes/auth");
const predictRoutes = require("./routes/predict");
app.use("/auth", authRoutes);
app.use("/", predictRoutes);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, HOST, () => {
      console.log(`✅ Server running at http://${HOST}:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
