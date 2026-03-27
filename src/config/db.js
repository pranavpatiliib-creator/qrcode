/**
 * Supabase connection helper with startup diagnostics.
 */
const { createClient } = require("@supabase/supabase-js");
const { env } = require("./env");

const CONNECT_TIMEOUT_MS = Number(process.env.SUPABASE_CONNECT_TIMEOUT_MS || 10000);
const CONNECT_RETRIES = Number(process.env.SUPABASE_CONNECT_RETRIES || 2);
const RETRY_DELAY_MS = Number(process.env.SUPABASE_CONNECT_RETRY_DELAY_MS || 1500);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureFetchAvailable() {
  if (typeof globalThis.fetch !== "function") {
    throw new Error(
      "Global fetch is not available. Use Node.js 18+ or install a fetch polyfill such as undici/node-fetch."
    );
  }
}

async function fetchWithTimeout(url, options = {}) {
  ensureFetchAvailable();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONNECT_TIMEOUT_MS);

  try {
    return await globalThis.fetch(url, {
      ...options,
      signal: controller.signal
    });
  } catch (error) {
    if (error && error.name === "AbortError") {
      throw new Error(`Supabase request timed out after ${CONNECT_TIMEOUT_MS}ms`);
    }

    const details = [];

    if (error && error.message) {
      details.push(error.message);
    }

    if (error && error.cause && error.cause.code) {
      details.push(`cause=${error.cause.code}`);
    }

    if (error && error.cause && error.cause.message) {
      details.push(error.cause.message);
    }

    throw new Error(`Network request to Supabase failed${details.length ? `: ${details.join(" | ")}` : ""}`);
  } finally {
    clearTimeout(timeout);
  }
}

function createSupabaseClient() {
  ensureFetchAvailable();

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      fetch: fetchWithTimeout
    }
  });
}

const supabase = createSupabaseClient();

function classifySupabaseError(error) {
  const message = String(error && error.message ? error.message : error || "");

  if (/timed out/i.test(message) || /ETIMEDOUT/i.test(message)) {
    return "Timeout reaching Supabase. Check internet connectivity, firewall, and DNS.";
  }

  if (/ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(message)) {
    return "DNS resolution failed for the Supabase host. Check SUPABASE_URL, DNS, VPN, or proxy settings.";
  }

  if (/ECONNREFUSED|ECONNRESET|fetch failed/i.test(message)) {
    return "Network connection to Supabase failed. Check firewall, proxy, antivirus HTTPS inspection, or unstable internet.";
  }

  if (/Invalid API key|Invalid JWT|JWT/i.test(message)) {
    return "Supabase key is invalid. Verify SUPABASE_SERVICE_ROLE_KEY and rotate it if it was exposed.";
  }

  return "Unknown Supabase startup error.";
}

async function runConnectionCheck() {
  const { error } = await supabase
    .from(env.SUPABASE_SCANS_TABLE)
    .select("student_id", { head: true, count: "exact" })
    .limit(1);

  if (error) {
    throw new Error(`Supabase responded with an error: ${error.message} (code=${error.code || "n/a"})`);
  }
}

async function connectDB() {
  let lastError = null;

  for (let attempt = 1; attempt <= CONNECT_RETRIES + 1; attempt += 1) {
    try {
      await runConnectionCheck();
      // eslint-disable-next-line no-console
      console.log(`Connected to Supabase table "${env.SUPABASE_SCANS_TABLE}"`);
      return;
    } catch (error) {
      lastError = error;

      // eslint-disable-next-line no-console
      console.error(`Supabase connection attempt ${attempt}/${CONNECT_RETRIES + 1} failed: ${error.message}`);

      if (attempt <= CONNECT_RETRIES) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  throw new Error(`Supabase connection failed: ${lastError.message}. ${classifySupabaseError(lastError)}`);
}

module.exports = { connectDB, supabase };
