export const ROOT = "/api";

export enum AUTH {
  ROOT = "/auth",
  REGISTER = "/register",
  LOGIN = "/login",
  REFRESH_TOKEN = "/refresh-token",
  AUTHORIZE = "/authorize",
}

export enum POST {
  ROOT = "/post",
  CREATE = "/create",
  FETCH = "/fetch",
}

export enum COMMENT {
  ROOT = "/comment",
  REPLY_ROOT = "/reply",
  CREATE = "/create",
  FETCH = "/fetch",
}

export enum REACTION {
  ROOT = "/reaction",
  CREATE = "/create",
  FETCH = "/fetch",
}

export enum NOTIFICATION {
  ROOT = "/notification",
  FETCH = "/fetch",
  DELETE = "/delete",
}

export enum CRON {
  ROOT = "/cron",
}
