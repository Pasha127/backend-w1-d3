import { checkSchema, validationResult } from "express-validator"
import createHttpError from "http-errors"

const authorSchema = { 
  author:{
    firstName:{
        isString: {
        errorMessage: "First name  is a mandatory field and needs to be a string!",
    }
    },
    lastName:{
        isString: {
        errorMessage: "Last name  is a mandatory field and needs to be a string!",
    }
    },
    username:{
        isString: {
        errorMessage: "Username  is a mandatory field and needs to be a string!",
    }
    },
    password:{
        isString: {
        errorMessage: "Password is a mandatory field and needs to be a string!",
    }
    },
    role:{
        isString: {
        errorMessage: "Role is a mandatory field and needs to be a string!",
    }
    },
    avatar: {        
    isString: {
      errorMessage: "Avatar image is a mandatory field and needs to be a URL string!",
    }
    },
    email: {        
      isEmail: {
        errorMessage: "Email is a mandatory field and needs to be a valid email!",
      }
      }
  }  
}



export const checkAuthorSchema = checkSchema(authorSchema) 
export const checkValidationResult = (req, res, next) => { 
  const errors = validationResult(req)
  if (!errors.isEmpty()) {   
    next(
      createHttpError(400, "Validation errors in request body!", {
        errorsList: errors.array(),
      })
    );
    console.log("400here", errors);
  } else {
    next()
  }
}