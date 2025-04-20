import { object as yobject, string as ystring } from "yup";
import { CONTENT } from "./constants";

export const CommentSchemaValidation = yobject().shape({
  userId: ystring().uuid().required("user id is required"),
  postId: ystring().required("post id is required"),
  content: ystring()
    .required("Content is required")
    .min(CONTENT.MIN, "content shouldn't be empty.")
    .max(
      CONTENT.MAX,
      "content cannot exceed more that " + CONTENT.MAX + " characters"
    ),
  parentCommentId: ystring().optional(),
  imageUrl: ystring().required("image url is required"),
  username: ystring().required("username is required"),
});
