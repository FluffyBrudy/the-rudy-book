import { Router } from "express";
import { NOTIFICATION } from "./routes";
import { RetriveNotificationController } from "../controller/notification/NotificationController";

const notificationRouter = Router();

notificationRouter.get(NOTIFICATION.FETCH, RetriveNotificationController);

export { notificationRouter };
