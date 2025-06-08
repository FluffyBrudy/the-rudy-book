import pino, { destination, transport } from "pino";

export const logger = pino(
  transport({
    target: "pino-pretty",
    options: {
      destination: "./logs",
      colorize: false,
    },
    level: "error",
  })
);
