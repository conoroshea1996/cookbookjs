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
    res.render("Auth.ejs");
})

app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) throw err;
        if (!user) res.send("no USER");
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
        res.render("Auth.ejs", {alreadyExist: true })
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

app.get("/user", async (req, res) => {
    console.log(req.user);
})


app.get("/api/auth/google", passport.authenticate("google", {scope: ["email", "profile"]}))

app.get("/api/auth/google/callback",
    passport.authenticate('google', {
        successRedirect: "http://localhost:5000",
        failureRedirect: '/error'
    }
));



app.listen(port);