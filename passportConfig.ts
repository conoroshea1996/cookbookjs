import { PrismaClient, User } from ".prisma/client";
import { PassportStatic } from "passport";

const LocalStrategy = require("passport-local").Strategy;
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const prisma = new PrismaClient();
module.exports = function (passport: PassportStatic) {
    passport.use(
        new LocalStrategy({ usernameField: "email" },
            async (email: string, password: string, done: Function) => {
            const user = await prisma.user.findUnique({ where: {email: email} })

            done(null, user);
    }));
    
    passport.use(new GoogleStrategy({
        clientID:  process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: "http://localhost:5000/api/auth/google/callback",
    }, async (_request:any , _accessToken:any, _refreshToken:any, profile:any, done:Function) => {
        const user = await prisma.user.findUnique({
            where: {
            email: profile.email
        } });
            
        if (!user) done(null, false);

        done(null, user);
    }))


    passport.serializeUser((user: any, cb) => {
        cb(null, user.id);
    })

    passport.deserializeUser(async (id: number, cb) => {
        const user = await prisma.user.findUnique({ where: { id } });
        console.log(user,"Serialize");
        cb(null, user);
    })
}

