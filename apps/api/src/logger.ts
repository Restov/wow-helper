import { Elysia } from "elysia";
import pino from "pino";

const environment = Bun.env.NODE_ENV ?? "development";
const usePrettyLogs = environment === "development" && process.stdout.isTTY;

export const logger = pino(
  {
    level: environment === "test" ? "silent" : (Bun.env.LOG_LEVEL ?? "info"),
    base: {
      service: "api",
      environment,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        "authorization",
        "cookie",
        "password",
        "token",
        "accessToken",
        "refreshToken",
        "req.headers.authorization",
        "req.headers.cookie",
      ],
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

type RequestLogContext = {
  requestId: string;
  startedAt: number;
};

const requestContexts = new WeakMap<Request, RequestLogContext>();

function getRequestFields(request: Request) {
  const url = new URL(request.url);
  const context = requestContexts.get(request);

  return {
    requestId: context?.requestId,
    method: request.method,
    path: url.pathname,
  };
}

export const requestLogger = new Elysia({ name: "request-logger" })
  .onRequest(({ request, set }) => {
    const requestId =
      request.headers.get("x-request-id") ?? crypto.randomUUID();

    requestContexts.set(request, {
      requestId,
      startedAt: performance.now(),
    });
    set.headers["x-request-id"] = requestId;
  })
  .onError(({ code, error, request, set }) => {
    logger.error(
      {
        ...getRequestFields(request),
        code,
        err: error,
        status: set.status,
      },
      "Request failed",
    );
  })
  .onAfterResponse(({ request, set }) => {
    const context = requestContexts.get(request);

    logger.info(
      {
        ...getRequestFields(request),
        status: set.status,
        durationMs: context
          ? Number((performance.now() - context.startedAt).toFixed(2))
          : undefined,
      },
      "Request completed",
    );

    requestContexts.delete(request);
  })
  .as("global");
