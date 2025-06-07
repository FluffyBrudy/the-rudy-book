import pino, { destination, transport } from "pino";

export const logger = pino(
  transport({
    target: "pino-pretty",
    options: {
      destination: "./logs.json",
      colorize: false,
    },
    level: "error",
  })
);

logger.error({ error: { error: "acar" } });
