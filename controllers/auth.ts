import express from "express";
import { PrismaClient, User } from '@prisma/client'
import { PassportStatic } from "passport"
import { userCreateDto } from "../models/users/userDto";

const passport: PassportStatic = require("passport");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient()
const router = express.Router();

router.get("/", (req, res) => {
    return res.render("Auth.ejs", { url: process.env.APPLICATON_URL, view:"login" });
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) throw err;
        if (!user) {
            res.render("Auth.ejs", { view: "login", userNotFound: true, url: process.env.APPLICATON_URL });
        }
        else {
            req.logIn(user, err => {
                if (err) throw err;

                return res.render("Home.ejs", {user: user});
            })
        }
    })(req, res, next);
})

router.post("/register", async (req, res) => {
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
        
        return req.logIn(createdUser, err => {
            res.render("Home.ejs", { user: createdUser });
        });
    }
})

module.exports = router;