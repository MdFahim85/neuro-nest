import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cookieParser from "cookie-parser";

dotenv.config();
const app: Application = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
});

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(limiter);
app.use(helmet());
app.use(express.json());

app.use("/api/v1/users", require("./routes/userRoute"));
app.use("/api/v1/auth", require("./routes/authRoute"));
app.use("/api/v1/posts", require("./routes/postRoute"));
app.use("/api/v1/communities", require("./routes/communityRoute"));
app.use("/api/v1/notifications", require("./routes/notificationRoute"));

app.get("/", (_req, res) => {
  res.send("Welcome");
});

export default app;
