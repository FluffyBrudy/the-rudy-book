import axios from "axios";
import { NotificationData } from "../types/globalTypes";
import { logger } from "../logger/logger";

export async function sendNotification<T>(
  data: NotificationData<T>,
  bearerToken: string
) {
  try {
    const response = await axios.post(
      process.env.SOCKET_SERVER!,
      { data },
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
