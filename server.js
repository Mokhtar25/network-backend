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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var express_session_1 = require("express-session");
var passport_1 = require("passport");
var passport_local_1 = require("passport-local");
var passport_github2_1 = require("passport-github2");
var pg_1 = require("pg");
var path_1 = require("path");
var passport_google_oauth20_1 = require("passport-google-oauth20");
var connect_redis_1 = require("connect-redis");
var redis_1 = require("redis");
require("dotenv/config");
var local = passport_local_1.localSta.Strategy;
console.log(process.env.hi);
var redisClient = (0, redis_1.createClient)();
redisClient.connect().catch(console.error);
var redisStore = new connect_redis_1.default({
    client: redisClient,
    prefix: "myapp:",
});
var db = new pg_1.Pool({
    host: "localhost", // or wherever the db is hosted
    user: "moktarali",
    database: "users_passport",
    password: "200106",
    port: 5432, // The default port
});
var app = (0, express_1.default)();
app.use(express_1.default.static(path_1.default.join(__dirname, "index")));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
var verfiy = function (username, password, done) { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db.query("select * from usernames where username = $1 and password = $2", [username, password])];
            case 1:
                data = _a.sent();
                console.log(data.rows[0]);
                if (!data.rows[0])
                    return [2 /*return*/, done(null, false)];
                return [2 /*return*/, done(null, data.rows[0])];
        }
    });
}); };
var start = new local.Strategy(verfiy);
passport_1.default.use(start);
passport_1.default.serializeUser(function (user, done) {
    done(null, user.username);
});
passport_1.default.deserializeUser(function (userId, done) { return __awaiter(void 0, void 0, void 0, function () {
    var user, userI;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db.query("select * from usernames where username = $1", [
                    userId,
                ])];
            case 1:
                user = _a.sent();
                userI = user.rows[0];
                //console.log(user.rows[0], "----------user");
                done(null, userI);
                return [2 /*return*/];
        }
    });
}); });
app.use((0, express_session_1.default)({
    secret: "asdkosadakods;",
    resave: false,
    saveUninitialized: true,
    store: redisStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    },
}));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GoogleClientID,
    clientSecret: process.env.GoogleClientSecret,
    callbackURL: "http://localhost:8080/login/google",
}, function (_, _, profile, done) {
    return __awaiter(this, void 0, void 0, function () {
        var data, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.query("select * from usernames where username = $1", [profile.id])];
                case 1:
                    data = _a.sent();
                    console.log(data.rows[0], "------------- find");
                    if (!!data.rows[0]) return [3 /*break*/, 4];
                    console.log(profile.id);
                    console.log("create ================================");
                    return [4 /*yield*/, db.query("insert into usernames (username, password) values ($1, 'google')", [profile.id])];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db.query("select * from usernames where username = $1", [profile.id])];
                case 3:
                    res = _a.sent();
                    console.log(res, "---------------------------");
                    return [2 /*return*/, done(null, res.rows[0])];
                case 4: return [2 /*return*/, done(null, data.rows[0])];
            }
        });
    });
}));
passport_1.default.use(new passport_github2_1.Strategy({
    clientID: process.env.GithubClientID,
    clientSecret: process.env.GithubClientSecret,
    callbackURL: "http://localhost:8080/login/github",
}, function (_, _, profile, done) {
    return __awaiter(this, void 0, void 0, function () {
        var data, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.query("select * from usernames where username = $1", [profile.username])];
                case 1:
                    data = _a.sent();
                    console.log(data.rows[0], "------------- find");
                    console.log(profile);
                    if (!!data.rows[0]) return [3 /*break*/, 3];
                    console.log("create ================================");
                    return [4 /*yield*/, db.query("insert into usernames (username, password) values ($1, 'github')", [profile.username])];
                case 2:
                    res = _a.sent();
                    console.log(res.rows[0], "---------------------------");
                    return [2 /*return*/, done(null, res.rows[0])];
                case 3: return [2 /*return*/, done(null, data.rows[0])];
            }
        });
    });
}));
app.use(passport_1.default.session());
//app.get("/", (req, res) => {
//  res.send("<h2>hello, world</h2>");
//});
app.get("/login", function (req, res) {
    res.sendFile(path_1.default.join(__dirname, "index.html"));
});
app.post("/login", passport_1.default.authenticate("local", { failureRedirect: "/" }), function (req, res, next) {
    res.send("hi");
    console.log("da");
});
app.get("/login/api/github", passport_1.default.authenticate("github", { scope: ["user:email"] }));
app.get("/login/github", passport_1.default.authenticate("github", { failureRedirect: "/login" }), function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
});
app.get("/login/api/google", passport_1.default.authenticate("google", { scope: ["profile"] }));
app.get("/login/google", passport_1.default.authenticate("google", { failureRedirect: "/login" }), function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
});
app.get("/pro", function (req, res, next) {
    console.log(req.isAuthenticated(), req.session);
    if (req.isAuthenticated())
        return res.send("auth ypi are");
    res.send("inot auth");
});
var httpServer = http.createServer(app);
var server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer: httpServer })],
});
var log = function () { return console.log("run"); };
server.start().then(function () {
    app.use(log, expressMiddleware(server));
    httpServer.listen({ port: 4000 }, function () {
        console.log("\uD83D\uDE80 Server ready at http://localhost:4000");
    });
});
