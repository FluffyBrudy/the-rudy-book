import expressSession from "express-session";

export const mainSession = () =>
  expressSession({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "prod",
      httpOnly: process.env.NODE_ENV === "prod",
    },
  });
