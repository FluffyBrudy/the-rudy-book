import { ExpressUser } from "../types/global";
import jwt from "jsonwebtoken";
import { StringValue } from "ms";

export function generateToken(
  user: Omit<ExpressUser, "username">,
  expiresIn: StringValue = "1h"
) {
  const accessToken = jwt.sign(user, process.env.JWT_SECRET!, {
    expiresIn: expiresIn,
  });
  return accessToken;
}
