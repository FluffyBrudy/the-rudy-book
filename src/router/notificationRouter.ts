import { Router } from "express";
import { NOTIFICATION } from "./routes";
import {
  DeleteNotificationController,
  RetriveNotificationController,
  ToggleNotificationReadStatus,
} from "../controller/notification/NotificationController";

const notificationRouter = Router();

notificationRouter.get(NOTIFICATION.FETCH, RetriveNotificationController);
notificationRouter.post(NOTIFICATION.DELETE, DeleteNotificationController);
notificationRouter.post(NOTIFICATION.TOGGLE_READ, ToggleNotificationReadStatus);

export { notificationRouter };
