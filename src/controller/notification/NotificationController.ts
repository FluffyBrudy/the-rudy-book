import { RequestHandler } from "express";
import * as yup from "yup";
import { ExpressUser } from "../../types/globalTypes";
import { mainDb } from "../../database/dbClient";
import { wrapResponse } from "../../utils/responseWrapper";
import { NotificationsResponse } from "../../types/apiResponse";
import { formatDistanceToNow } from "date-fns";
import {
  ApiError,
  BodyValidationError,
  LoggerApiError,
} from "../../errors/errors";
import { DatabaseError } from "pg";
import { sql } from "kysely";

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

const DEFAULT_LIMIT = 10;
export const RetriveNotificationController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const user = req.user as ExpressUser;
    const notificationPage = parseInt(req.query.page as string) || 0;
    const notifications = await mainDb
      .selectFrom("notification")
      .selectAll()
      .where("user_id", "=", user.id)
      .orderBy("created_at", "desc")
      .offset(notificationPage * DEFAULT_LIMIT)
      .limit(DEFAULT_LIMIT)
      .execute();
    const responseObj = wrapResponse<NotificationsResponse[]>(
      notifications.map((notification) => ({
        isRead: notification.is_read,
        userId: notification.user_id,
        notificationOnId: notification.notification_on_id,
        notificationOnType: notification.notification_on_type,
        notificationInfo: notification.notification_info,
        createdAt: formatDistanceToNow(notification.created_at!, {
          addSuffix: true,
        }),
        notificationId: notification.id,
      }))
    );
    res.status(200).json(responseObj);
  } catch (error) {
    return next(new LoggerApiError(error, 500));
  }
};

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
