import createHttpError from "http-errors"
import atob from "atob"
import AuthorsModel from "../authors/model.js"

export const basicAuth = async (req,res,next)=>{
    if (!req.headers.authorization) {
        next(createHttpError(401, `Cannot authorize without credentials.`))
      } else {         
        const decodedCredentials = atob(req.headers.authorization.split(" ")[1])
        const [email, password] = decodedCredentials.split(":")
        const user = await AuthorsModel.checkCredentials(email, password)
        if (user) {            
            req.user = user
            next()
          } else {            
            next(createHttpError(401, `Email or Password Incorrect`))
          }
        }

}
export const adminOnly = (req, res, next) => {
    if (req.user.role === "Admin") {
      next()
    } else {
      next(createHttpError(403, "Insufficient permission. Access denied."))
    }
  }