import { checkSchema, validationResult } from "express-validator"
import createHttpError from "http-errors"

const blogSchema = {
  category: {
    in: ["body"],
    isString: {
      errorMessage: "Category is a mandatory field and needs to be a string!",
    },
  },
  title: {
    in: ["body"],
    isString: {
      errorMessage: "Title is a mandatory field and needs to be a string!",
    },
  },
  cover: {
    in: ["body"],
    isString: {
      errorMessage: "Cover image is a mandatory field and needs to be a URL string!",
    },
  },
  readTime:{
    value:{
        isNumber:{
            errorMessage: "Value is a mandatory field and needs to be a number!",
          }
    },
    unit:{
        isString:{
            errorMessage: "Unit is a mandatory field and needs to be a string!",
          }
    }
  },
  author:{
    name:{
        isString: {
        errorMessage: "Author name  is a mandatory field and needs to be a string!",
    }
    },
    avatar: {        
    isString: {
      errorMessage: "Avatar image is a mandatory field and needs to be a URL string!",
    }
    }    

  },
  content:{
    in: ["body"],
    isString: {
      errorMessage: "Content is a mandatory field and needs to be a strigified HTML element!",
    }
  }
  
}



export const checkBlogSchema = checkSchema(blogSchema) 
export const checkValidationResult = (req, res, next) => { 
  const errors = validationResult(req)
  if (!errors.isEmpty()) {   
    next(
      createHttpError(400, "Validation errors in request body!", {
        errorsList: errors.array(),
      })
    )
  } else {
    next()
  }
}