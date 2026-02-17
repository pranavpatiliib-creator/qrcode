const { env } = require("../config/env");
const { verifyAuthToken } = require("../utils/authToken");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required"
    });
  }

  const result = verifyAuthToken(token, env.AUTH_TOKEN_SECRET);
  if (!result.valid) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired session"
    });
  }

  req.auth = { userId: result.userId, exp: result.exp };
  return next();
}

module.exports = { requireAuth };
