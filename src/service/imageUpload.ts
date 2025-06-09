import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";
import { Readable } from "stream";
import { logger } from "../logger/logger";

require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME!,
  api_key: process.env.CLOUD_API_KEY!,
  api_secret: process.env.CLOUD_API_SECRET!,
});

async function makeUploadStream(buffer: Buffer, public_id: string) {
  return new Promise((resolve, reject) => {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        public_id: public_id,
        overwrite: false,
        folder: "pigeon-messanger",
      },
      (err, res) => {
        if (err) reject(err);
        else resolve(res);
      }
    );
    stream.pipe(uploadStream);
  });
}

export async function uploadImageFromBuffer(imageBuffer: Buffer, name: string) {
  const publicId = name;
  try {
    const response = await makeUploadStream(imageBuffer, publicId);
    const { secure_url } = response as UploadApiResponse;
    return { secure_url };
  } catch (err) {
    logger.error(err);
    const error = err as UploadApiErrorResponse;
    if (error?.http_code === 409) {
      return {
        secure_url: cloudinary.url(publicId, { secure: true, format: "svg" }),
      };
    }
    return null;
  }
}

export function convertSVGToBuffer(svgString: string) {
  const bufferData = Buffer.from(svgString, "utf-8");
  return bufferData;
}
