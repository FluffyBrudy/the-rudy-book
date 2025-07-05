"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactionRouter = void 0;
const express_1 = require("express");
const routes_1 = require("./routes");
const createUserReactionController_1 = require("../controller/reactionController/createUserReactionController");
const reactionRouter = (0, express_1.Router)();
exports.reactionRouter = reactionRouter;
reactionRouter.post(routes_1.REACTION.CREATE, createUserReactionController_1.CreateUserReactionController);
