"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronRouter = void 0;
const express_1 = require("express");
const routes_1 = require("./routes");
const dbClient_1 = require("../database/dbClient");
const errors_1 = require("../errors/errors");
const kysely_1 = require("kysely");
const cronRouter = (0, express_1.Router)();
exports.cronRouter = cronRouter;
cronRouter.get(routes_1.CRON.ROOT, (_, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, kysely_1.sql) `
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
    `.execute(dbClient_1.mainDb);
        res.json({ ok: true });
    }
    catch (error) {
        return next(new errors_1.LoggerApiError(error, 500));
    }
}));
