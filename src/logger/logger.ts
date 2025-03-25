import pino, { transport } from "pino";

let logger = { error(arg: any) {} };

if (process.env.NODE_ENV !== "prod") {
  const logger = pino(
    transport({
      level: "error",
      target: "pino/file",
      options: {
        destination: "./logs.log",
      },
    })
  );
}

export { logger };
