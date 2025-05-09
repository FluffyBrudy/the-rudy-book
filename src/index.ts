import express from "express";
import passport from "passport";
import { authStrategy } from "./middleware/autStrategy";
import { mainSession } from "./middleware/mainSession";
import { MainRouter } from "./routers/mainRouter";
import { API } from "./routers/constants";
import { errorMiddleware } from "./middleware/error";
import { verifyDbConnection } from "./middleware/dbConnection";

require("dotenv").config();

const app = express();
app.use(mainSession());
app.use(express.json());
app.use(passport.session());

app.use(verifyDbConnection);

app.use(API.ROOT, MainRouter);
passport.use(authStrategy());

app.use(errorMiddleware());

if (process.env.NODE_ENV === "dev") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log("Running at http://localhost:" + PORT);
  });
}
