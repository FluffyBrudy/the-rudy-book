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
  SEARCH = "/search",
  FETCH_BY_ID = "/fetch/:postId",
  FETCH_USER_POST = "/fetch/user/:userId",
}

export enum COMMENT {
  ROOT = "/comment",
  REPLY_ROOT = "/reply",
  CREATE = "/create",
  FETCH = "/fetch",
  FETCH_COMMENT_BY_ID = "/fetch/:commentId",
  FETCH_REPLY_BY_ID = "/fetch/:commentReplyId",
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
  TOGGLE_READ = "/toggle-read",
}

export enum CRON {
  ROOT = "/cron",
}
