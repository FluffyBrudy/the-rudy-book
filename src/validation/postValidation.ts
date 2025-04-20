import { ObjectSchema, object as zobject, string as zstring } from "yup";
import { CONTENT, USERNAME } from "./constants";
import { IPost } from "../types/mongoClient";

type IPostSchemaValidation = Omit<
  IPost,
  "reactions" | "comments" | "createdAt"
>;

export const PostSchemaValidation: ObjectSchema<IPostSchemaValidation> =
  zobject().shape({
    username: zstring()
      .required("Username is required")
      .trim()
      .min(
        USERNAME.MIN,
        `Username must be at least ${USERNAME.MIN} characters long`
      )
      .max(
        USERNAME.MAX,
        `Username must be at most ${USERNAME.MAX} characters long`
      ),

    userId: zstring()
      .required("User ID is required")
      .uuid("Invalid User ID format"),

    imageUrl: zstring()
      .required("Image URL is required")
      .trim()
      .url("Image URL must be a valid URL"),

    content: zstring()
      .required("Content is required")
      .trim()
      .min(CONTENT.MIN, `Content must be at least ${CONTENT.MIN} characters`)
      .max(CONTENT.MAX, `Content must not exceed ${CONTENT.MAX} characters`),
  });
