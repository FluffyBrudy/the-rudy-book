import axios from "axios";
import { logger } from "../logger/logger";
import { createNotification } from "./dbCommonQuery";
import { EReactionOnTypes } from "../constants/validation";

export async function sendNotification(
  receiverId: string,
  notificationInfo: string,
  notificationOnId: number,
  notificationOnType: EReactionOnTypes,
  bearerToken: string
) {
  try {
    const data = await createNotification(
      receiverId,
      notificationInfo,
      notificationOnId,
      notificationOnType
    );
    if (!data) return;

    const sockData = {
      receiverId,
      notificationInfo,
      notificationOnId,
      notificationOnType,
    };

    const response = await axios.post(
      process.env.SOCKET_SERVER!,
      { ...sockData },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: bearerToken,
        },
      }
    );
    if (response.status !== 200) {
      logger.error({
        error: `[${response.status}][${response.statusText}]: unable to send notification"`,
      });
    }
  } catch (error) {
    logger.error(error);
  }
}
