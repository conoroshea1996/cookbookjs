
declare namespace Express {
    interface Request {
        user?: import("../../models/users/applicationUser").IUser
    }
}