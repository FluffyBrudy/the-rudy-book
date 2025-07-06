import { RequestHandler } from "express";
import { ApiError, LoggerApiError } from "../../errors/errors";
import { mainDb } from "../../database/dbClient";
import { sql } from "kysely";
import { wrapResponse } from "../../utils/responseWrapper";
import { SearchPostResponse } from "../../types/apiResponse";

type PostSearchResponse = { content_tsv: string, post_id: number, content: string }

export const SearchPostController: RequestHandler = async (req, res, next) => {
    const query = (req.query.q ?? "") as unknown as string
    if (!query) return next(new ApiError(400, "empty query"))
    if (query.length < 3) return next(new ApiError(400, "insufficient search term"))

    try {
        const lexemeRegex = /\||&|!|\*|:/
        const hasLexeme = query.match(lexemeRegex)
        if (!hasLexeme) {
            const posts = await sql<PostSearchResponse>`
              SELECT content_tsv, post_id, content from text_content
              WHERE content_tsv @@ to_tsquery(${query})
              `.execute(mainDb);
            const response = wrapResponse(formatDbResponse(posts.rows))
            res.json(response)
        } else {
            const tokenizedQuery = query.split(lexemeRegex).join('|')
            const posts = await sql<PostSearchResponse>`
              SELECT content_tsv, post_id, content from text_content
              WHERE content_tsv @@ to_tsquery(${tokenizedQuery})
              `.execute(mainDb);
            const response = wrapResponse(formatDbResponse(posts.rows))
            res.json(response)
        }
    } catch (error) {
        return next(new LoggerApiError(error, 500))
    }
}

function formatDbResponse(response: Array<PostSearchResponse>): Array<SearchPostResponse> {
    return response.map(obj => ({
        postId: obj.post_id,
        matchedContent: obj.content_tsv,
        fullContent: obj.content
    }))
}