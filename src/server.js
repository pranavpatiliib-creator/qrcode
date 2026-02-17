/**
 * Entry point for the Express REST API.
 *
 * Start in development:
 *   npm run dev
 *
 * Start in production:
 *   npm start
 */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { env } = require("./config/env");
const { connectDB } = require("./config/db");
const scanRoutes = require("./routes/scanRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandlers");

const app = express();

const allowedOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from same-origin tools and non-browser clients.
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS"));
    }
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'", "https:", "data:"],
        connectSrc: ["'self'", "https:"],
        mediaSrc: ["'self'", "blob:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        scriptSrcAttr: ["'none'"]
      }
    }
  })
);

app.use((_req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(self)");
  next();
});
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10kb" }));
app.use(express.static("public"));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", scanRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  await connectDB();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on port ${env.PORT}`);
  });
}

startServer().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});
