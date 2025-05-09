import { object as yobject, string as ystring } from "yup";
import { COLLECTIONS } from "../db/mongoClient/mongoClient";
import { EReactions } from "../types/enums";

export const UserReactionValidation = yobject().shape({
  targetId: ystring().required(`target id is required`).trim(),
  targetType: ystring()
    .oneOf([COLLECTIONS.COMMENT, COLLECTIONS.POST])
    .required("target type is required")
    .trim(),
  reactionType: ystring()
    .oneOf(Object.values(EReactions))
    .required("reaction type is required")
    .trim(),
});
