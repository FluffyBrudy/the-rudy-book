import pino, { transport } from "pino";

let logger = { error(_: any) {}, info(_: any) {} };

if (process.env.NODE_ENV !== "prod") {
  logger = pino(
    transport({
      target: "pino/file",
      options: {
        destination: "./logs.log",
      },
    })
  );
}

export { logger };
