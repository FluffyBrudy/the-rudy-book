import { Router } from "express";
import { NOTIFICATION } from "./routes";
import { DeleteNotificationController } from "../controller/notification/deleteNotificationController";
import { RetriveNotificationController } from "../controller/notification/retriveNotificationController";
import { ToggleNotificationReadStatus } from "../controller/notification/toggleNotificationReadStatus";

const notificationRouter = Router();

notificationRouter.get(NOTIFICATION.FETCH, RetriveNotificationController);
notificationRouter.post(NOTIFICATION.DELETE, DeleteNotificationController);
notificationRouter.post(NOTIFICATION.TOGGLE_READ, ToggleNotificationReadStatus);

export { notificationRouter };
