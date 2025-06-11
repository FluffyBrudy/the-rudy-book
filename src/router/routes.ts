export const ROOT = "/api";

export enum AUTH {
  ROOT = "/auth",
  REGISTER = "/register",
  LOGIN = "/login",
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
