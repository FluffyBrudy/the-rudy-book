import { object as yobject, string as ystring } from "yup";
import { CONTENT } from "./constants";

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
