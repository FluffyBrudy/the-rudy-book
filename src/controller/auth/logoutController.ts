import { Request, Response, NextFunction } from "express";
import { LoggerApiError } from "../../errors/errors";

export const LogoutController = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            signed: true,
            sameSite: "none",
            partitioned: true,
            path: "/"
        });

        res.status(200).json({ message: "Successfully logged out." });
    } catch (error) {
        return next(new LoggerApiError(error, 500))
    }
};
