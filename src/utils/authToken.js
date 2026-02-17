const crypto = require("crypto");

function toBase64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function createAuthToken(userId, ttlMinutes, secret) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    uid: userId,
    iat: now,
    exp: now + Math.max(60, Math.floor(ttlMinutes * 60))
  };
  const payloadPart = toBase64Url(JSON.stringify(payload));
  const signaturePart = sign(payloadPart, secret);
  return `${payloadPart}.${signaturePart}`;
}

function verifyAuthToken(token, secret) {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false, reason: "missing_or_malformed" };
  }

  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) {
    return { valid: false, reason: "missing_or_malformed" };
  }

  const expectedSignature = sign(payloadPart, secret);
  const provided = Buffer.from(signaturePart);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return { valid: false, reason: "bad_signature" };
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadPart));
    if (!payload || !payload.uid || !payload.exp) {
      return { valid: false, reason: "bad_payload" };
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { valid: false, reason: "expired" };
    }

    return { valid: true, userId: payload.uid, exp: payload.exp };
  } catch {
    return { valid: false, reason: "bad_payload" };
  }
}

module.exports = {
  createAuthToken,
  verifyAuthToken
};
