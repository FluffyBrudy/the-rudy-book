import { Router } from "express";
import { CRON } from "./routes";
import { mainDb } from "../database/dbClient";
import { LoggerApiError } from "../errors/errors";
import { sql } from "kysely";

const cronRouter = Router();

cronRouter.get(CRON.ROOT, async (_, res, next) => {
  try {
    await sql`
        DO $$
            BEGIN
            DELETE FROM top_posts;
            PERFORM pg_sleep(0);  
            
            IF random() < 0.4 THEN
                
                INSERT INTO top_posts (post_id)
                SELECT p.post_id
                FROM post p
                LEFT JOIN reaction r
                ON r.reaction_on_type = 'post' AND r.reaction_on_id = p.post_id
                GROUP BY p.post_id
                ORDER BY COUNT(r.reactor_id) DESC
                LIMIT 20;
            
            ELSIF random() < 0.8 THEN
                
                INSERT INTO top_posts (post_id)
                SELECT p.post_id
                FROM post p
                LEFT JOIN comment c
                ON c.post_id = p.post_id
                GROUP BY p.post_id
                ORDER BY COUNT(c.comment_id) DESC
                LIMIT 20;
            
            ELSE
                
                INSERT INTO top_posts (post_id)
                SELECT p.post_id
                FROM post p
                ORDER BY random()
                LIMIT 20;
            END IF;
        END $$;
    `.execute(mainDb);
    res.json({ ok: true });
  } catch (error) {
    return next(new LoggerApiError(error, 500));
  }
});

export { cronRouter };
