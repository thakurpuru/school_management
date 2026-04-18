import cors from "cors";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import morgan from "morgan";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js";
import configurePassport from "./config/passport.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storagePath = path.join(__dirname, "..", "storage");

configurePassport(passport);

const sessionConfig = {
  secret: process.env.SESSION_SECRET || "school-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 8,
    httpOnly: true
  }
};

if (process.env.MONGODB_URI) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  });
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session(sessionConfig)
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/storage", express.static(storagePath));

app.get("/api/health", (_req, res) => {
  res.json({ message: "School Management System API is running" });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
