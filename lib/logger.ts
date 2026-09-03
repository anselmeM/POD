type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  message: string;
  level: LogLevel;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    name?: string;
    message: string;
    stack?: string;
  };
}

const SENSITIVE_KEYS = new Set([
  "authorization",
  "password",
  "token",
  "secret",
  "stripe-signature",
  "cookie",
]);

function sanitize(obj: unknown, depth = 0): unknown {
  if (depth > 3 || !obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item, depth + 1));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      result[key] = sanitize(value, depth + 1);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function outputLog(level: LogLevel, message: string, context?: Record<string, unknown>, err?: unknown) {
  const payload: LogPayload = {
    message,
    level,
    timestamp: new Date().toISOString(),
    ...(context ? { context: sanitize(context) as Record<string, unknown> } : {}),
  };

  if (err instanceof Error) {
    payload.error = {
      name: err.name,
      message: err.message,
      ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
    };
  }

  const jsonStr = JSON.stringify(payload);
  switch (level) {
    case "error":
      console.error(jsonStr);
      break;
    case "warn":
      console.warn(jsonStr);
      break;
    case "info":
    default:
      console.log(jsonStr);
      break;
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) =>
    outputLog("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    outputLog("warn", message, context),
  error: (message: string, err?: unknown, context?: Record<string, unknown>) =>
    outputLog("error", message, context, err),
  debug: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "production") {
      outputLog("debug", message, context);
    }
  },
};
