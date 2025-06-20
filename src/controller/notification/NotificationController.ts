import { RequestHandler } from "express";
import * as yup from "yup";
import { ExpressUser } from "../../types/globalTypes";
import { mainDb } from "../../database/dbClient";
import { wrapResponse } from "../../utils/responseWrapper";
import { NotificationsResponse } from "../../types/apiResponse";
import { formatDistanceToNow } from "date-fns";
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

const DEFAULT_LIMIT = 10;
export const RetriveNotificationController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const user = req.user as ExpressUser;
    const notificationPage = parseInt(req.params["page"]) + 1 || 0;
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
        notificationId: notification.id,
        userId: notification.user_id,
        notificationOnId: notification.notification_on_id,
        notificationOnType: notification.notification_on_type,
        notificationInfo: notification.notification_info,
        createdAt: formatDistanceToNow(notification.created_at!, {
          addSuffix: true,
        }),
      }))
    );
    res.status(200).json(responseObj);
  } catch (error) {
    return next(new LoggerApiError(error, 500));
  }
};

export const deleteNotifications: RequestHandler = async (req, res, next) => {
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
