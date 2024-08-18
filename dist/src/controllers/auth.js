var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import passport from "passport";
import { Router } from "express";
import env from "../../env";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GitHubStrategy, } from "passport-github2";
import { Strategy as GoogleStrategy, } from "passport-google-oauth20";
import "dotenv/config";
import { db } from "../server";
export const loginRouter = Router();
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
        .catch((err) => done(err, false));
};
const start = new LocalStrategy(verfiy);
passport.use(start);
passport.serializeUser((user, done) => {
    console.log("run ser", user);
    done(null, user.username);
});
passport.deserializeUser((userId, done) => {
    db.query("select * from usernames where username = $1", [userId])
        .then((result) => {
        if (!result.rows[0])
            return done(null, false);
        const user = result.rows[0];
        done(null, user);
    })
        .catch((err) => done(err, null));
});
passport.use(new GoogleStrategy({
    clientID: env.GoogleClientID,
    clientSecret: env.GithubClientSecret,
    callbackURL: "http://localhost:8080/login/google",
    passReqToCallback: true,
}, function (_, __, ___, ____, profile, done) {
    // First query to check if the user exists
    db.query("SELECT * FROM usernames WHERE username = $1", [profile.id])
        .then((data) => {
        // If user does not exist, insert the new user
        if (!data.rows[0]) {
            return db
                .query("INSERT INTO usernames (username, password) VALUES ($1, 'google')", [profile.id])
                .then(() => {
                // Query again to get the newly created user
                return db.query("SELECT * FROM usernames WHERE username = $1", [
                    profile.id,
                ]);
            })
                .then((res) => {
                // Pass the new user to the done callback
                return done(null, res.rows[0]);
            });
        }
        // If user exists, pass the existing user to the done callback
        return done(null, data.rows[0]);
    })
        .catch((err) => {
        // Handle any errors by passing them to the done callback
        console.error(err);
        return done(err);
    });
}));
passport.use(new GitHubStrategy({
    clientID: env.GithubClientID,
    clientSecret: env.GithubClientSecret,
    callbackURL: "http://localhost:4000/login/github/callback",
}, function (_, __, profile, done) {
    // Query to find the user by GitHub username
    db.query("SELECT * FROM usernames WHERE username = $1", [
        profile.username,
    ])
        .then((data) => {
        console.log(data.rows[0], "------------- find");
        console.log(profile);
        // If user does not exist, insert the new user
        if (!data.rows[0]) {
            console.log("create ================================");
            return db
                .query("INSERT INTO usernames (username, password) VALUES ($1, 'github')", [profile.username])
                .then(() => {
                // Return the newly inserted user
                return db.query("SELECT * FROM usernames WHERE username = $1", [
                    profile.username,
                ]);
            })
                .then((res) => {
                console.log(res.rows[0], "---------------------------");
                return done(null, res.rows[0]);
            });
        }
        // If user exists, pass the existing user to the done callback
        return done(null, data.rows[0]);
    })
        .catch((err) => {
        // Handle any errors by passing them to the done callback
        console.error(err);
        return done(err);
    });
}));
loginRouter.use(passport.session());
loginRouter.get("/test", (_req, res) => {
    res.send("<h2>hello, world auth</h2>");
});
// prettier-ignore
loginRouter.post("/login", passport.authenticate("local", { failureRedirect: "/" }), (_req, res) => {
    res.send("hi");
    console.log("da");
});
const log = (_req, _res, next) => {
    console.log("run");
    next();
};
loginRouter.use(log);
loginRouter.get("/api/github", passport.authenticate("github", { scope: ["user:email"] }));
loginRouter.get("/api/google", passport.authenticate("google", {
    scope: ["profile"],
}));
loginRouter.get("/github/callback", passport.authenticate("github", {
    failureRedirect: "/login",
}), function (_req, res) {
    // Successful authentication, redirect home.
    res.redirect("/login/pro");
}, loginRouter.get("/google", passport.authenticate("google", {
    failureRedirect: "/login",
}), function (_req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
}));
loginRouter.get("/pro", (req, res) => {
    console.log(req.isAuthenticated(), req.session);
    if (req.isAuthenticated())
        return res.send("authenticated");
    return res.send("not authenticated");
});
