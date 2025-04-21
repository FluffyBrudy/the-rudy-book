import { ObjectSchema, object as zobject, string as zstring } from "yup";
import { CONTENT } from "./constants";
import { IPost } from "../types/mongoClient";

type IPostSchemaValidation = Omit<
  IPost,
  "reactions" | "comments" | "createdAt" | "username" | "userId" | "imageUrl"
>;

export const PostSchemaValidation: ObjectSchema<IPostSchemaValidation> =
  zobject().shape({
    content: zstring()
      .required("Content is required")
      .trim()
      .min(CONTENT.MIN, `Content must be at least ${CONTENT.MIN} characters`)
      .max(CONTENT.MAX, `Content must not exceed ${CONTENT.MAX} characters`),
  });
