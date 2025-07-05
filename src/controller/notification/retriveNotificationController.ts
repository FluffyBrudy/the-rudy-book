import { RequestHandler } from "express";
import { ExpressUser } from "../../types/globalTypes";
import { mainDb } from "../../database/dbClient";
import { wrapResponse } from "../../utils/responseWrapper";
import { NotificationsResponse } from "../../types/apiResponse";
import { formatDistanceToNow } from "date-fns";
import { LoggerApiError } from "../../errors/errors";

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
