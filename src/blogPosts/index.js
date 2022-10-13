import express from "express";
import { extname} from "path";
import uniqid from "uniqid";
import { checkBlogSchema, checkValidationResult } from "./validator.js"
import { deleteTempJSON, getBlogPosts, getPdfTextReadStream, writeBlogPosts, getCSVReadStream, sendEmail } from "../library/fs-tools.js";
 import multer from "multer"; 
import createHttpError from "http-errors";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { pipeline } from "stream"
import { createGzip } from "zlib"
import json2csv from "json2csv"



const cloudinaryUploader = multer({
    storage: new CloudinaryStorage({
      cloudinary, 
      params: {folder: "BlogPics"},
    }),
    limits: { fileSize: 1024 * 1024 },
  }).single("image")

const blogPostRouter = express.Router();

blogPostRouter.get("/:blogPostId/json", async (req, res, next) => {
    try {   
      res.setHeader("Content-Disposition", "attachment; filename=post.json.gz");
      const source = await getPdfTextReadStream(req.params.blogPostId);
      const destination = res;
      const transform = createGzip();
      pipeline(source, transform, destination, async err => {
        if (err) console.log(err)
        await deleteTempJSON();
      });
      
    } catch (error) {
      next(error)
    }
  })
  
blogPostRouter.get("/csv", async (req, res, next) => {
    try {   
      res.setHeader("Content-Disposition", "attachment; filename=All_Posts.csv");
      const source = getCSVReadStream();
      const transform = new json2csv.Transform({
        fields: ["_id", "title", "category","author","createdAt","content"],
      })
      const destination = res;
      pipeline(source, transform, destination, async err => {
        if (err) console.log(err)
      });
      
    } catch (error) {
      next(error)
    }
  })
  


blogPostRouter.get("/", async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "GET posts at:", new Date());
        const blogPosts = await getBlogPosts();
        res.status(200).send(blogPosts)        
    }catch(error){ 
        next(error)
    }    
})


blogPostRouter.get("/:blogPostId" , async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "GET post at:", new Date());
        const blogPostId = req.params.blogPostId;
        const blogPostsArray = await getBlogPosts();
        const foundBlogPost = blogPostsArray.find(blogPost =>blogPost._id === blogPostId)
        /* console.log(foundBlogPost); */
        if(foundBlogPost){
            res.status(200).send(foundBlogPost);
        }else{next(createHttpError(404, "Blogpost Not Found"));
    } 
    }catch(error){
        next(error);
    }
})


blogPostRouter.post("/", checkBlogSchema, checkValidationResult, async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "POST post at:", new Date());
        const newBlogPost = {...req.body, createdAt:new Date(), _id:uniqid()};
        const blogPostsArray = await getBlogPosts();  
        blogPostsArray.push(newBlogPost);
        await writeBlogPosts(blogPostsArray);
        /* console.log("email:", req.body.author.email) */
        const email = req.body.author.email
        await sendEmail(email)
        res.status(201).send({message:`Added a new blogPost.`,_id:newBlogPost._id});
        
    }catch(error){
        next(error)
    }
})

 blogPostRouter.post("/images/:blogPostId/cover",cloudinaryUploader, async (req,res,next)=>{try{     
     console.log("tried to post an cover", req.file);
     const blogPostsArray = await getBlogPosts();
     const entryIndex = blogPostsArray.findIndex(blogPost => blogPost._id === req.params.blogPostId);
     const oldBlogPost = blogPostsArray[entryIndex];    
     const updatedBlogPost = {...oldBlogPost, cover: req.file.path, updatedAt:new Date()}
     blogPostsArray[entryIndex] = updatedBlogPost;
    res.status(201).send({message: "Blog Post Cover Uploaded"})
}catch(error){/* next(error) */console.log(error)}}) 


blogPostRouter.post("/images/:blogPostId/avatar",cloudinaryUploader, async (req,res,next)=>{try{
     console.log("tried to post an avatar", req.file);
     const blogPostsArray = await getBlogPosts();
     const entryIndex = blogPostsArray.findIndex(blogPost => blogPost._id === req.params.blogPostId);
     const oldBlogPost = blogPostsArray[entryIndex];    
     const updatedBlogPost = {...oldBlogPost, author:{...author,avatar:req.file.path}, updatedAt:new Date()}
     blogPostsArray[entryIndex] = updatedBlogPost;
     await writeBlogPosts(blogPostsArray);
    res.status(201).send({message: "Avatar Uploaded"})
 }catch(error){next(error)}}) 




blogPostRouter.put("/:blogPostId", async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "PUT post at:", new Date());
        const blogPostsArray = await getBlogPosts();
        const entryIndex = blogPostsArray.findIndex(blogPost => blogPost._id === req.params.blogPostId);
        const oldBlogPost = blogPostsArray[entryIndex];    
        const updatedBlogPost = {...oldBlogPost, ...req.body, updatedAt:new Date()}
        blogPostsArray[entryIndex] = updatedBlogPost;
        await writeBlogPosts(blogPostsArray);
        res.status(200).send(updatedBlogPost)
        
    }catch(error){ 
        next(error)
    }
})


blogPostRouter.delete("/:blogPostId", async (req,res,next)=>{try{
    console.log(req.headers.origin, "DELETE post at:", new Date());
    const blogPostsArray = await getBlogPosts();
    const remainingBlogPosts = blogPostsArray.filter(blogPost => blogPost._id !== req.params.blogPostId);
    if(blogPostsArray.length === remainingBlogPosts.length){
        next(createHttpError(404, "Blogpost Not Found"));
    }else{
    await writeBlogPosts(remainingBlogPosts);
    res.status(204).send({message:"blogPost has been deleted."})
    }
}catch(error){
    next(error)
}
})


export default blogPostRouter;