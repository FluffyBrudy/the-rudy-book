import { RequestHandler } from "express";
import * as yup from "yup";
import { mainDb } from "../../database/dbClient";
import { wrapResponse } from "../../utils/responseWrapper";
import { BodyValidationError, LoggerApiError, ApiError } from "../../errors/errors";
import { DatabaseError } from "pg";
import { sql } from "kysely";

export const ToggleNotificationReadStatus: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { notificationId } = yup
      .object()
      .shape({
        notificationId: yup
          .number()
          .required("notification identifier is required"),
      })
      .validateSync(req.body);
    const notification = await mainDb
      .updateTable("notification")
      .where("notification.id", "=", notificationId)
      .set({
        is_read: sql<boolean>`NOT is_read`,
      })
      .returning("is_read")
      .executeTakeFirst();

    res.json(
      wrapResponse<{ isRead: boolean }>({
        isRead: notification?.is_read ?? false,
      })
    );
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return next(new BodyValidationError(error.errors));
    }
    if (error instanceof DatabaseError && error.code === "23503") {
      return next(new ApiError(404, "notification not found", true));
    }
    return next(new LoggerApiError(error, 500));
  }
};
