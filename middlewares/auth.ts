import type { RequestHandler } from "express";

export const ensureAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated())
    return next();
  else
    return res.redirect("/auth/index");
};