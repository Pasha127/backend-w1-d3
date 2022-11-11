import express from "express";
import { checkAuthorSchema, checkValidationResult } from "./validator.js"
import multer from "multer"; 
import passport from "passport";
import createHttpError from "http-errors";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import authorModel from "../authors/model.js"
import { adminOnly, JWTAuth } from "../authentication/authenticators.js";
import { refreshTokens, createTokens } from "../authentication/tokenTools.js";


const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary, 
    params: {folder: "BlogPics"},
  }),
  limits: { fileSize: 1024 * 1024 },
}).single("image")

const blogPostRouter = express.Router();

const authorRouter = express.Router();

authorRouter.get("/googleLogin", passport.authenticate("google",{scope:["email","profile"]}))

authorRouter.get("/googleRedirect", passport.authenticate("google",{session: false}), async (req, res, next) => {

  try {
    const {accessToken,refreshToken} = req.user
    res.cookie("accessToken",accessToken,{"httpOnly":true});
    res.cookie("refreshToken",refreshToken,{"httpOnly":true});
    res.redirect(`${process.env.FE_DEV_URL}/`/* ?loginSuccessful=true */ );
  }catch(error){
    console.log(error)
      next(error);
  }   
})

authorRouter.post("/register", async (req, res, next) => {
    try {
        console.log(req.headers.origin, "POST author at:", new Date());        
        const newAuthor = new authorModel(req.body);
        const{_id}= await newAuthor.save();
        if (_id) {
            const { accessToken, refreshToken } = await createTokens(newAuthor)
            res.send({ accessToken, refreshToken })
          } else {
            next(createHttpError(401, `Unauthorized`))
          }

        res.status(201).send({message:`Added a new author and logged in.`,_id});        
    }catch(error){
      console.log(error)
        next(error);
    }   
  })
authorRouter.post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body
      const author = await authorModel.checkCredentials(email, password)  
      if (author) {
        const { accessToken, refreshToken } = await createTokens(author)
        /* res.send({ accessToken, refreshToken }) */
        res.cookie("accessToken", accessToken)
        res.cookie("refreshToken", refreshToken)
        res.redirect(`${process.env.FE_DEV_URL}/`)
      } else {
        res.redirect(`${process.env.FE_DEV_URL}/`)
        next(createHttpError(401, `Unauthorized`))
      }
    } catch (error) {
      next(error)
    }
  })
  
authorRouter.post("/refreshTokens", async (req, res, next) => {
    try {
      const { currentRefreshToken } = req.body   
      const { accessToken, refreshToken } = await refreshTokens(currentRefreshToken)
      res.cookie("accessToken", accessToken)
      res.cookie("refreshToken", refreshToken)
      res.status(201).send({message: "refreshed tokens"})
    } catch (error) {
      next(error)
    }
  })
  


authorRouter.get("/", JWTAuth, async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "GET author at:", new Date());
        const authors = await authorModel.find()
        res.status(200).send(authors)        
    }catch(error){ 
        next(error)
    }    
})

authorRouter.get("/me", JWTAuth, async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "GET author at:", new Date());
        console.log(req);
        const author = await authorModel.find({_id: req.author._id});
        if(author){console.log("found author", author)
        res.status(200).send(author)}
        else{
          res.redirect(`${process.env.FE_DEV_URL}/`)
          next(createHttpError(404, "Author not found"));
        }        
    }catch(error){ 
      console.log("error me")
        next(error)
    }    
})
authorRouter.get("/logout", JWTAuth, async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "GET author at:", new Date());
        console.log(req);
        const author = await authorModel.find({_id: req.author._id});
        if(author){console.log("found author", author)
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        res.redirect(`${process.env.FE_DEV_URL}/`)}
        else{
          next(createHttpError(404, "Author not found"));
        }        
    }catch(error){ 
      console.log("error me")
        next(error)
    }    
})

authorRouter.get("/:authorId", JWTAuth, adminOnly, async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "GET author at:", new Date());       
        const foundAuthor = await authorModel.findById(req.params.author)
        if(foundAuthor){
            res.status(200).send(foundAuthor);
        }else{next(createHttpError(404, "author Not Found"));
    } 
    }catch(error){
        next(error);
    }
})


authorRouter.post("/", JWTAuth, checkAuthorSchema, checkValidationResult, adminOnly, async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "POST author at:", new Date());
        const newAuthor = new authorModel(req.body);
        const{_id}= await newAuthor.save();

        res.status(201).send({message:`Added a new author.`,_id});
        
    }catch(error){
        next(error);
    }
})



authorRouter.post("/images/:authorId/avatar", cloudinaryUploader, async (req,res,next)=>{try{
     console.log("tried to post an avatar", req.file.path);
     await authorModel.findByIdAndUpdate(req.params.authorId, {author: {avatar: req.file.path}}, {new:true, runValidators:true});   
        
    res.status(201).send({message: "Avatar Uploaded"});
 }catch(error){console.log(error)}}); 




authorRouter.put("/:authorId", JWTAuth, adminOnly, async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "PUT post at:", new Date());
        await authorModel.findByIdAndUpdate(req.params.authorId, {author:
           {...req.body}}, {new:true, runValidators:true});   
     
        res.status(200).send(updatedAuthor);
        
    }catch(error){ 
        next(error);
    }
})


authorRouter.delete("/:authorId", JWTAuth, adminOnly, async (req,res,next)=>{try{
    console.log(req.headers.origin, "DELETE post at:", new Date());
    const deletedAuthor =  await authorModel.findByIdAndDelete(req.params.authorId)      
    if(deletedBlogPost){
      res.status(204).send({message:"blogPost has been deleted."})
    }else{
      next(createHttpError(404, "Blogpost Not Found"));    
    }
}catch(error){
    next(error)
}
})




export default authorRouter;