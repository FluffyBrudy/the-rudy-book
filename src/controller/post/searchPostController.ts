import { RequestHandler } from "express";
import { ApiError, LoggerApiError } from "../../errors/errors";
import { mainDb } from "../../database/dbClient";
import { sql } from "kysely";
import { wrapResponse } from "../../utils/responseWrapper";

export const SearchPostController: RequestHandler = async (req, res, next) => {
    const query = (req.query ?? "") as unknown as string
    if (!query) return next(new ApiError(400, "empty query"))
    if (query.length < 3) return next(new ApiError(400, "insufficient search term"))

    try {
        const lexemeRegex = /\||&|!|\*|:/
        const hasLexeme = query.match(lexemeRegex)
        if (!hasLexeme) {
            const posts = await sql`
              SELECT content_tsv, post_id from text_content
              WHERE content_tsv @@ plainto_tsquery(${query})
              `.execute(mainDb);
            const response = wrapResponse(posts)
            res.json(response)
        } else {
            const tokenizedQuery = query.split(lexemeRegex).join('|')
            const posts = await sql`
              SELECT content_tsv, post_id from text_content
              WHERE content_tsv @@ plainto_tsquery(${tokenizedQuery})
              `.execute(mainDb);
            const response = wrapResponse(posts)
            res.json(response)
        }
    } catch (error) {
        return next(new LoggerApiError(error, 500))
    }
}