export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 50;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 16;

export const MAX_POST_TEXT_LENGTH = 1500;
export const MAX_POST_MEDIA_CONTENT_LENGTH = 5;

export const MAX_COMMENT_LENGTH = 500;
export const MAX_COMMENT_ROWS_FETCH_LIMIT = 50;

export enum EReactionTypes {
  THUMBUP = "thumbup",
  SAD = "sad",
  ANGRY = "angry",
  CARE = "care",
  HEART = "heart",
  FUNNY = "funny",
}

export enum EReactionOnTypes {
  COMMENT = "comment",
  POST = "post",
  REPLY = "reply",
}
