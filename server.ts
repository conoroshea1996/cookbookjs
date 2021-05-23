import express from "express";
import { PrismaClient, User } from '@prisma/client'
import { json } from "body-parser";
import { PassportStatic } from "passport"
import { userCreateDto } from "./models/users/userCreateDto";
const cors = require("cors");
const passport: PassportStatic = require("passport");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const prisma = new PrismaClient()
const app = express()

const port = process.env.PORT || 5000;

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
    secret: process.env.COOKIE_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());

// set the view engine to ejs
app.set('view engine', 'ejs');

app.get("/auth", (req, res) => {
    res.render("Auth.ejs", { url: process.env.APPLICATON_URL, view:"login" });
})

app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) throw err;

        if (!user) {
            res.render("Auth.ejs", { view: "login", userNotFound: true, url: process.env.APPLICATON_URL });
        }
        else {
            req.logIn(user, err => {
                if (err) throw err;

                res.render("Home.ejs", {user: user});
            })
        }
    })(req, res, next);
})

app.post("/register", async (req, res) => {
    const existingUser = await prisma.user.findUnique({ where: { email: req.body.email } })
    if (existingUser) {
        res.render("Auth.ejs", {view: "register", alreadyExist: true , url: process.env.APPLICATON_URL })
    } else {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser: userCreateDto = {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hashedPassword,
        };
        
       const createdUser = await prisma.user.create({ data: newUser });
        
        req.logIn(createdUser, err => {
            res.render("Home.ejs", { user: createdUser });
        });
    }
})

app.get("/api/auth/google", passport.authenticate("google", {scope: ["email", "profile"]}))

app.get("/api/auth/google/callback",
    passport.authenticate('google', {
        successRedirect: process.env.APPLICATON_URL,
        failureRedirect: '/error'
    }
));




const STATIC = path.resolve(__dirname, "public", "build");
const INDEX = path.resolve(__dirname,"public", 'index.html');
app.use(express.static(STATIC));

app.get("/*", (req, res) => {
    if (!req.user) {
        return res.render("Auth.ejs", {view: "register", url: process.env.APPLICATON_URL })
    }
    res.sendFile(INDEX);
})

app.listen(port);