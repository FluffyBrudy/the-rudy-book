import { object as zobject, string as zstring } from "yup";
import { CONTENT } from "./constants";

export const PostSchemaValidation = zobject().shape({
  content: zstring()
    .required("Content is required")
    .trim()
    .min(CONTENT.MIN, `Content must be at least ${CONTENT.MIN} characters`)
    .max(CONTENT.MAX, `Content must not exceed ${CONTENT.MAX} characters`),
});
