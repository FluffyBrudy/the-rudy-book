import pino, { transport } from "pino";

let logger = { error(arg: any) {}, info(arg: any) {} };
if (process.env.NODE_ENV === "dev") {
  let logger = pino(
    transport({
      target: process.env.NODE_ENV === "dev" ? "pino-pretty" : "pino/file",
      options: {
        destination: "./logs",
        colorize: false,
      },
      level: "error",
    })
  );
}

export { logger };
