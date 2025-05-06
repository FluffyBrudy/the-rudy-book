import { object as yobject, string as ystring } from "yup";
import { CONTENT } from "./constants";
import { EReactions } from "../types/enums";

export const CommentSchemaValidation = yobject().shape({
  postId: ystring().required("post id is required"),
  content: ystring()
    .required("Content is required")
    .trim()
    .min(CONTENT.MIN, "content shouldn't be empty.")
    .max(
      CONTENT.MAX,
      "content cannot exceed more that " + CONTENT.MAX + " characters"
    ),
  parentCommentId: ystring().optional(),
});

export const UserReactionValidation = (targetType: "POST" | "COMMENT") => {
  const _targetType = targetType.toLocaleLowerCase();
  return yobject().shape({
    targetId: ystring().required(`${_targetType} id is required`).trim(),
    targetType: ystring().required(`${_targetType} id is required`).trim(),
    reactionType: ystring()
      .required("reaction is required")
      .oneOf(Object.keys(EReactions))
      .trim(),
  });
};
