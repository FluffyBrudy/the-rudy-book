import { model, Schema, InferSchemaType, Types } from "mongoose";
import { EReactions } from "../../types/enums";
import { COLLECTIONS } from "./constants";

const CommentSchema = new Schema({
  userId: {
    type: Schema.Types.UUID,
    required: true,
    validate: {
      validator: (v: string) => Types.UUID.isValid(v),
      message: "Invalid user id :)",
    },
  },
  username: { type: String, required: true, minlength: 4, maxlength: 50 },
  imageUrl: { type: String, required: true },
  postId: {
    type: Schema.Types.ObjectId,
    ref: COLLECTIONS.POST,
    required: true,
    validate: {
      validator: (v: string) => Types.ObjectId.isValid(v),
      message: "Invalid post id",
    },
  },
  content: {
    type: String,
    required: true,
    validate: { validator: (v: string) => v.length > 0 },
  },
  createdAt: { type: Date, default: () => new Date() },
  parentCommentId: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: COLLECTIONS.COMMENT,
    validate: {
      validator: (v: string) => Types.ObjectId.isValid(v),
      message: "Invalid parent id",
    },
  },
  reactions: {
    type: Map,
    of: Number,
    default: () =>
      new Map([
        [EReactions.THUMBUP, 0],
        [EReactions.ANGRY, 0],
        [EReactions.HEART, 0],
        [EReactions.CARE, 0],
      ]),
  },
});
CommentSchema.add({ replies: [CommentSchema] });

const PostSchema = new Schema({
  userId: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => Types.UUID.isValid(v),
      message: "Invalid user id",
    },
  },
  username: { type: String, required: true, minlength: 4, maxlength: 50 },
  imageUrl: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
  comments: [{ type: Types.ObjectId, ref: COLLECTIONS.COMMENT }],
  reactions: {
    type: Map,
    of: Number,
    default: () =>
      new Map([
        [EReactions.THUMBUP, 0],
        [EReactions.ANGRY, 0],
        [EReactions.HEART, 0],
        [EReactions.CARE, 0],
      ]),
  },
});

type PostDoc = InferSchemaType<typeof PostSchema>;
type CommentDoc = InferSchemaType<typeof CommentSchema>;

export const mongoDbClient = {
  Post: model<PostDoc>(COLLECTIONS.POST, PostSchema),
  Comment: model<CommentDoc>(COLLECTIONS.COMMENT, CommentSchema),
};
