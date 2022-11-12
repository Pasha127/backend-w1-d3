import createHttpError from "http-errors"
import atob from "atob"
import AuthorsModel from "../authors/model.js"
import { verifyAccessToken } from "./tokenTools.js"


export const adminOnly = (req, res, next) => {
    if (req.author.role === "Admin") {
      next();
    } else {
      next(createHttpError(403, "Insufficient permission. Access denied."));
    }
}

export const JWTAuth = async (req, res, next) => {
 /*  if (!req.headers.authorization) {
    next(createHttpError(401, "No Bearer token found in header!")) */
/*     console.log("Cookies:", req.cookies) */
    if (!req.cookies.accessToken) {      
      next(createHttpError(401, "No access token in cookies."))
  } else {
    try {
      /* const accessToken = req.headers.authorization.replace("Bearer ", ""); */
      const accessToken = req.cookies.accessToken
      const payload = await verifyAccessToken(accessToken)
      req.author = {
        _id: payload._id,
        role: payload.role,
      }
      next()
    } catch (error) {
      
      next(createHttpError(401, "Token invalid!"))
    }
  }
}