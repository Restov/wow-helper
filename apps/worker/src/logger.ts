import pino from "pino";

const environment = Bun.env.NODE_ENV ?? "development";
const usePrettyLogs = environment === "development" && process.stdout.isTTY;

export const logger = pino(
  {
    level: Bun.env.LOG_LEVEL ?? "info",
    base: {
      service: "worker",
      environment,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: ["password", "token", "accessToken", "refreshToken"],
      censor: "[REDACTED]",
    },
  },
  usePrettyLogs
    ? pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          singleLine: true,
          translateTime: "SYS:standard",
        },
      })
    : undefined,
);
