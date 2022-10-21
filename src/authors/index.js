import express from "express";

import { checkAuthorSchema, checkValidationResult } from "./validator.js"
import multer from "multer"; 
import createHttpError from "http-errors";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import authorModel from "../authors/model.js"

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary, 
    params: {folder: "BlogPics"},
  }),
  limits: { fileSize: 1024 * 1024 },
}).single("image")

const blogPostRouter = express.Router();

const authorRouter = express.Router();


authorRouter.get("/", async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "GET author at:", new Date());
        const authors = await authorModel.find()
        res.status(200).send(authors)        
    }catch(error){ 
        next(error)
    }    
})


authorRouter.get("/:authorId" , async (req,res,next)=>{
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


authorRouter.post("/", checkAuthorSchema, checkValidationResult, async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "POST author at:", new Date());
        console.log(req.body);
        const newPost = new authorModel(req.body);
        const{_id}= await newPost.save();

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




authorRouter.put("/:authorId", async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "PUT post at:", new Date());
        await authorModel.findByIdAndUpdate(req.params.authorId, {author:
           {...req.body}}, {new:true, runValidators:true});   
     
        res.status(200).send(updatedAuthor);
        
    }catch(error){ 
        next(error);
    }
})


authorRouter.delete("/:authorId", async (req,res,next)=>{try{
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