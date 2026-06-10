import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import rootRouter from "./routes/index.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "auth-token"]
}));

// connect DB
connectDB();

// test route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// main routes
app.use("/api", rootRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
``