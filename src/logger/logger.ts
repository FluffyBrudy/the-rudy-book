import pino, { destination, transport } from "pino";

export const logger = pino(
  transport({
    target: process.env.NODE_ENV === "dev" ? "pino-pretty" : "pino/file",
    options: {
      destination: "./logs",
      colorize: false,
    },
    level: "error",
  })
);
