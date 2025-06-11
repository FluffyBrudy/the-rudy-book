import { sql } from "kysely";
import { reactionDisplayInfo, ReactionResponse } from "../types/apiResponse";

export const totalReactionCount = () =>
  sql<number>`COALESCE(CAST(COUNT(reaction.reactor_id) AS INTEGER), 0)`.as(
    "totalReaction"
  );

export const aggregatedReactions = () =>
  sql<reactionDisplayInfo>`
    COALESCE(
      json_agg(
        json_build_object(
          'reactorId', reaction.reactor_id,
          'username', reaction.username,
          'profilePicture', reaction.image_url,
          'reaction_type', reaction.reaction_type
        )
      ) FILTER (WHERE reaction.reactor_id IS NOT NULL),
      '[]'::json
    )
  `.as("reactions");
