const crypto = require("crypto");
const express = require("express");
const { env } = require("../config/env");
const { createAuthToken } = require("../utils/authToken");

const router = express.Router();

function safeCompare(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

router.post("/login", (req, res) => {
  const { userId, password } = req.body || {};

  if (typeof userId !== "string" || typeof password !== "string") {
    return res.status(400).json({
      status: "error",
      message: "userId and password are required"
    });
  }

  const isUserValid = safeCompare(userId.trim(), env.AUTH_USER_ID);
  const isPasswordValid = safeCompare(password, env.AUTH_PASSWORD);
  if (!isUserValid || !isPasswordValid) {
    return res.status(401).json({
      status: "error",
      message: "Invalid credentials"
    });
  }

  const token = createAuthToken(env.AUTH_USER_ID, env.AUTH_TOKEN_TTL_MINUTES, env.AUTH_TOKEN_SECRET);

  return res.status(200).json({
    status: "success",
    message: "login ok",
    data: {
      userId: env.AUTH_USER_ID,
      token,
      expiresInMinutes: env.AUTH_TOKEN_TTL_MINUTES
    }
  });
});

module.exports = router;
