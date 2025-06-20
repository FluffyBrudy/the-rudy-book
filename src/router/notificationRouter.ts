import { Router } from "express";
import { NOTIFICATION } from "./routes";
import {
  DeleteNotificationController,
  RetriveNotificationController,
} from "../controller/notification/NotificationController";

const notificationRouter = Router();

notificationRouter.get(NOTIFICATION.FETCH, RetriveNotificationController);
notificationRouter.post(NOTIFICATION.DELETE, DeleteNotificationController);

export { notificationRouter };
