import axios from "axios";
import { logger } from "../logger/logger";

const MAX_FILE_SIZE = 1024 * 1024 * 5;
async function validateImageURL(imageUrl: string) {
  try {
    const response = await axios.head(imageUrl, {
      timeout: 5000,
    });

    if (response.status !== 200) return false;

    /*
         http1.0 spec says case insensative but autocompletion give Capitaalized, so  workaround
     */
    const contentType =
      response.headers["Content-Type"] ?? response.headers["content-type"];
    const contentLengthHeader =
      response.headers["Content-Length"] || response.headers["content-lenght"];
    const contentLength = contentLengthHeader
      ? parseInt(contentLengthHeader)
      : 0;

    const isSizeAcceptable =
      Number.isFinite(contentLength) && contentLength <= MAX_FILE_SIZE;

    const isContentImage =
      contentType &&
      typeof contentType === "string" &&
      contentType.startsWith("image/");
    return isContentImage && isSizeAcceptable;
  } catch (error) {
    logger.error({ ImageValidation: error });
    return false;
  }
}

export async function validateImageURLS(imageUrls: string[]) {
  const requestPromises: Promise<boolean>[] = imageUrls.map((imageUrl) =>
    validateImageURL(imageUrl)
  );
  const res = await Promise.all(requestPromises);
  return res.every(Boolean);
}
