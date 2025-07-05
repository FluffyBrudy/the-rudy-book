import { RequestHandler } from "express";
import * as yup from "yup";
import { mainDb } from "../../database/dbClient";
import { wrapResponse } from "../../utils/responseWrapper";
import { BodyValidationError, LoggerApiError } from "../../errors/errors";

const NotificationDeleteSchema = yup.object().shape({
  notificationIds: yup
    .array()
    .required("notification ids are required")
    .of(
      yup
        .number()
        .required("at least one id is required")
        .positive("invalid id")
    ),
});

export const DeleteNotificationController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { notificationIds } = NotificationDeleteSchema.validateSync(req.body);
    const response = await mainDb
      .deleteFrom("notification")
      .where("notification.id", "in", notificationIds)
      .execute();
    res.json(wrapResponse<{ count: number }>({ count: response.length }));
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return next(new BodyValidationError(error.errors));
    }
    return next(new LoggerApiError(error, 500));
  }
};
