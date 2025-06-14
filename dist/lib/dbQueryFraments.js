"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregatedReactions = exports.totalReactionCount = void 0;
const kysely_1 = require("kysely");
const totalReactionCount = () => (0, kysely_1.sql) `COALESCE(CAST(COUNT(reaction.reactor_id) AS INTEGER), 0)`.as("totalReaction");
exports.totalReactionCount = totalReactionCount;
const aggregatedReactions = () => (0, kysely_1.sql) `
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
exports.aggregatedReactions = aggregatedReactions;
