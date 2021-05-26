import express from "express";
import { PrismaClient, User } from '@prisma/client'
import { json } from "body-parser";
import { PassportStatic } from "passport"
import { userCreateDto } from "./models/users/userDto";
import { ensureAuthenticated } from "./middlewares/auth";

const cors = require("cors");
const passport: PassportStatic = require("passport");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const prisma = new PrismaClient()
const app = express()

const userRoutes = require('./controllers/user');
const authRoutes = require('./controllers/auth');

const port = process.env.PORT || 5000;
const STATIC = path.resolve(__dirname, "frontend", "dist");


require("./passportConfig")(passport);

app.use(json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  cors({
    origin: port, // <-- location of the react app were connecting to
    credentials: true,
  })
);

app.use(
    session({
        store: new (require('connect-pg-simple')(session))({
            conObject: {
            connectionString: process.env.DATABASE_URL,
            //   ssl: { rejectUnauthorized: false }
            },
        }),
        secret: process.env.COOKIE_SECRET,
        resave: false,
        cookie: { maxAge: 2 * 24 * 60 * 60 * 1000 },
        saveUninitialized: false
    })
);
app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());

// set the view engine to ejs
app.set('view engine', 'ejs');


app.get("/api/auth/google", passport.authenticate("google", {scope: ["email", "profile"]}))

app.get("/api/auth/google/callback",
    passport.authenticate('google', {
        successRedirect: process.env.APPLICATON_URL,
        failureRedirect: '/error'
    }
    ));


app.use('/api/*', userRoutes);
app.use("/auth/*", authRoutes);

app.use("/", ensureAuthenticated ,express.static(STATIC));

app.all("/*", (req, res) => {
    res.sendFile(path.resolve(STATIC, 'index.html'));
});

app.listen(port);