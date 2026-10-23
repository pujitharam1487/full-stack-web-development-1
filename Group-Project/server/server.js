const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const serverEnvPath = path.join(__dirname, ".env");
const rootEnvPath = path.join(__dirname, "..", ".env");
dotenv.config({ path: fs.existsSync(serverEnvPath) ? serverEnvPath : rootEnvPath });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const expenseRoutes = require("./routes/expenses");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/expenses", expenseRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Central error handler: turns Mongoose validation errors into 400 responses.
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((e) => e.message).join(", ");
    return res.status(400).json({ message });
  }
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => {
    console.error("Failed to start:", err.message);
    process.exit(1);
  });
