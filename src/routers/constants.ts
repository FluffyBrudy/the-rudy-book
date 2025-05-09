export enum API {
  ROOT = "/api",
}

export enum AUTH {
  ROOT = "/auth",
  REGISTER = "/register",
  LOGIN = "/login",
}

export enum SOCIAL {
  ROOT = "/social",
  FRIENDS_SEARCH = "/friends/search",
  FRIEND_REQUEST = "/friends/requests",
  PENDING_REQUESTS = "/friends/requests/pending",
  ACCEPTED_REQUESTS = "/friends/requests/accepted",
  ACCEPT_REQUEST = "/friends/requests/accept",
  REJECT_REQUEST = "/friends/requests/reject",
}

export enum CHAT {
  ROOT = "/chat",
  MESSAGE_CREATE = "/message/create",
  MESSAGE_FETCH = "/message/fetch",
  MESSAGE_SINGLE = "/message/fetch/latest",
}

export enum PREFERENCE {
  ROOT = "/preference",
  PREF_PROFILE_SIGNATURE = "/profile/signature",
  PREF_PROFILE_IMAGE = "/profile/image",
}

export enum SILENT {
  ROOT = "/silent",
  LOGIN = "/login",
}

export enum POST {
  ROOT = "/post",
  CREATE = "/create",
}

export enum COMMENT {
  ROOT = "/comment",
  CREATE = "/create",
}

export enum REACTION {
  ROOT = "/reaction",
  CREATE = "/create",
}
