import { UploadApiResponse, UploadApiErrorResponse, v2 } from "cloudinary";
import { uploadImageFromBuffer } from "../service/imageUpload";
import { logger } from "../logger/logger";

function generateGradient(name: string) {
  const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color1 = `hsl(${hash % 360}, 70%, 60%)`;
  const color2 = `hsl(${(hash + 60) % 360}, 70%, 60%)`;
  return [color1, color2];
}

function generateAvatarSVG(name: string, size = 64) {
  const initials = name ? name[0].toUpperCase() : "?";
  const [color1, color2] = generateGradient(name);

  return `
<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="50" fill="url(#grad-${name})" />
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
        font-size="40" fill="white" font-family="Arial, sans-serif">
    ${initials}
  </text>
</svg>
  `.trim();
}

export async function uploadDefaultProfileImage(name: string) {
  const svgString = generateAvatarSVG(name);
  const bufferData = Buffer.from(svgString);
  const uploadResponse = await uploadImageFromBuffer(bufferData, name);
  return uploadResponse?.secure_url ?? null;
}
