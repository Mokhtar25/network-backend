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
// import crypto from "crypto";
const passport_1 = __importDefault(require("passport"));
const server_1 = require("@apollo/server");
const passport_local_1 = require("passport-local");
const passport_github2_1 = require("passport-github2");
const pg_1 = require("pg");
const path_1 = __importDefault(require("path"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const connect_redis_1 = __importDefault(require("connect-redis"));
const redis_1 = require("redis");
require("dotenv/config");
const express4_1 = require("@apollo/server/express4");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const http_1 = __importDefault(require("http"));
console.log(process.env.hi);
const redisClient = (0, redis_1.createClient)();
redisClient.connect().catch(console.error);
const redisStore = new connect_redis_1.default({
    client: redisClient,
    prefix: "myapp:",
});
const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;
// A map of functions which return data for the schema.
const resolvers = {
    Query: {
        hello: () => "world",
    },
};
const db = new pg_1.Pool({
    host: "localhost", // or wherever the db is hosted
    user: "moktarali",
    database: "users_passport",
    password: "200106",
    port: 5432, // The default port
});
const app = (0, express_1.default)();
app.use(express_1.default.static(path_1.default.join(__dirname, "index")));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const verfiy = (username, password, done) => {
    const dataFunc = () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield db.query("select * from usernames where username = $1 and password = $2", [username, password]);
        return data;
    });
    dataFunc()
        .then((data) => {
        if (!data.rows[0])
            done(null, false);
        else {
            done(null, data.rows[0]);
        }
    })
        .catch(() => done(null, false));
};
const start = new passport_local_1.Strategy(verfiy);
passport_1.default.use(start);
passport_1.default.serializeUser((user, done) => {
    console.log("run ser", user);
    done(null, user.username);
});
//passport.deserializeUser(async (userId, done) => {
//  const user = await db.query("select * from usernames where username = $1", [
//    userId,
//  ]);
//  if (!user.rows[0]) done(null, false);
//  const userI = user.rows[0] as User;
//
//  //console.log(user.rows[0], "----------user");
//  done(null, userI);
//});
app.use((0, express_session_1.default)({
    secret: "asdkosadakods;",
    resave: false,
    saveUninitialized: true,
    store: redisStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    },
}));
passport_1.default.deserializeUser((userId, done) => {
    db.query("select * from usernames where username = $1", [userId])
        .then((result) => {
        if (!result.rows[0])
            return done(null, false);
        const user = result.rows[0];
        done(null, user);
    })
        .catch((err) => done(err, null));
});
// prettier-ignore
const loger = (req, _, next) => {
    console.log(req.user);
    next();
};
app.use(loger);
const google = process.env.GoogleClientID;
const googleSec = process.env.GoogleClientSecret;
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: google,
    clientSecret: googleSec,
    callbackURL: "http://localhost:8080/login/google",
}, 
// prettier-ignore
function (_, __, profile, done) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield db.query("select * from usernames where username = $1", [profile.id]);
        console.log(data.rows[0], "------------- find");
        if (!data.rows[0]) {
            console.log(profile.id);
            console.log("create ================================");
            yield db.query("insert into usernames (username, password) values ($1, 'google')", [profile.id]);
            const res = yield db.query("select * from usernames where username = $1", [profile.id]);
            console.log(res, "---------------------------");
            return done(null, res.rows[0]);
        }
        return done(null, data.rows[0]);
    });
}));
passport_1.default.use(new passport_github2_1.Strategy({
    clientID: process.env.GithubClientID,
    clientSecret: process.env.GithubClientSecret,
    callbackURL: "http://localhost:8080/login/github",
}, function (_, __, profile, done) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield db.query("select * from usernames where username = $1", [profile.username]);
        console.log(data.rows[0], "------------- find");
        console.log(profile);
        if (!data.rows[0]) {
            console.log("create ================================");
            const res = yield db.query("insert into usernames (username, password) values ($1, 'github')", [profile.username]);
            console.log(res.rows[0], "---------------------------");
            return done(null, res.rows[0]);
        }
        return done(null, data.rows[0]);
    });
}));
app.use(passport_1.default.session());
app.get("/", (req, res) => {
    res.send("<h2>hello, world</h2>");
});
app.get("/login", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "index.html"));
});
// prettier-ignore
app.post("/login", passport_1.default.authenticate("local", { failureRedirect: "/" }), (req, res, next) => {
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
app.get("/pro", (req, res, _) => {
    console.log(req.isAuthenticated(), req.session);
    if (req.isAuthenticated())
        return res.send("auth ypi are");
    res.send("inot auth");
});
const httpServer = http_1.default.createServer(app);
const server = new server_1.ApolloServer({
    typeDefs,
    resolvers,
    plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
});
const log = () => console.log("run");
server.start().then(() => {
    app.use(log, (0, express4_1.expressMiddleware)(server));
    httpServer.listen({ port: 4000 }, () => {
        console.log(`🚀 Server ready at http://localhost:4000`);
    });
});
