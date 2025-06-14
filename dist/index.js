"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const mainRouter_1 = require("./router/mainRouter");
const passport_jwt_1 = require("passport-jwt");
const errors_1 = require("./errors/errors");
const dbClient_1 = require("./database/dbClient");
const passport_1 = __importDefault(require("passport"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middleware/errorHandler");
const routes_1 = require("./router/routes");
require("dotenv").config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "*", credentials: true })); // todo: filter origin
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    cookie: {
        secure: process.env.NODE_ENV == "prod",
        httpOnly: process.env.NODE_ENV == "prod",
        maxAge: 24 * 60 * 60 * 1000,
    },
}));
app.use(passport_1.default.session());
passport_1.default.use(new passport_jwt_1.Strategy({
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
}, (user, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUser = yield dbClient_1.pigeonDb
            .selectFrom("User")
            .select(["User.id", "User.username"])
            .where("User.id", "=", user.id)
            .executeTakeFirst();
        if (existingUser)
            return done(null, existingUser);
        else
            return done(new errors_1.ApiError(404, "user:"), false);
    }
    catch (error) {
        done(new errors_1.ApiError(500), false);
    }
})));
app.use(routes_1.ROOT, mainRouter_1.mainRouter);
app.use((0, errorHandler_1.errorHandler)());
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV === "dev") {
    app.listen(PORT, () => {
        console.log(`listening at port: http://localhost:${PORT}`);
    });
}
exports.default = app;
