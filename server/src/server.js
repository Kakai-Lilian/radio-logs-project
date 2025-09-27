import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import logRoutes from "./routes/logs.js"; // import your log routes  

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // allows frontend to connect
app.use(express.json()); // parse JSON request body

// Routes
app.use("/api/logs", logRoutes);

// Default route (health check)
app.get("/", (req, res) => {
  res.send("✅ Radio Logs API is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});



