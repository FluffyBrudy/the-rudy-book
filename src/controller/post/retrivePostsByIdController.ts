import { RequestHandler } from "express";
import * as yup from "yup";
import { retrivePosts } from "../../lib/dbCommonQuery";
import { BodyValidationError, ApiError, LoggerApiError } from "../../errors/errors";
import { PostResponse } from "../../types/apiResponse";
import { ExpressUser } from "../../types/globalTypes";
import { wrapResponse } from "../../utils/responseWrapper";

export const RetrivePostsByIdController: RequestHandler = async (
  req,
  res,
  next
) => {
  const user = req.user as ExpressUser;
  const targetId = req.params.userId as string | undefined;
  if (!targetId) return next(new BodyValidationError(["user id is required"]));

  try {
    const userId = yup
      .string()
      .required()
      .uuid("user id must be valid id")
      .validateSync(targetId);
    const response = await retrivePosts(user.id, [userId], false);
    if (!response) {
      return next(new ApiError(500, "unable to retrive post", true));
    }
    const filteredPost = response?.filter(Boolean) as unknown as
      | PostResponse[]
      | null;
    const posts = filteredPost?.reduce(
      (accm, post) => accm.concat(post),
      [] as PostResponse[]
    );
    const responseObj = wrapResponse<PostResponse[]>(posts);
    res.status(200).json(responseObj);
  } catch (error) {
    if (error instanceof yup.ValidationError)
      return next(new BodyValidationError(error.errors));
    return next(new LoggerApiError(error, 500));
  }
};
