import express, { response } from "express";
import fs from "fs-extra";
import { dirname, extname, join } from "path";
import { fileURLToPath } from "url";
import uniqid from "uniqid";
import createHttpError from "http-errors"
import { checkBlogSchema, checkValidationResult } from "./validator.js"
import multer from "multer";
import { getBlogPosts, saveBlogPostAvatars, saveBlogPostCover, writeBlogPosts } from "../library/fs-tools.js";



const blogPostRouter = express.Router();



blogPostRouter.get("/", async (req,res,next)=>{
    try{
        console.log(req.ip, "GET posts at:", new Date());
        const blogPosts = await getBlogPosts();
        res.status(200).send(blogPosts)        
    }catch(error){ 
        next(error)
    }
    
})

blogPostRouter.get("/:blogPostId" , async (req,res,next)=>{
    try{
        console.log(req.ip, "GET post at:", new Date());
        const blogPostId = req.params.blogPostId;
        const blogPostsArray = await getBlogPosts();
        const foundBlogPost = blogPostsArray.find(blogPost =>blogPost._id === blogPostId)
        /* console.log(foundBlogPost); */
        if(foundBlogPost){
            res.status(200).send(foundBlogPost);
        }else{res.status(404).send("Post Not Found");console.log(noPost);} 
    }catch(error){
        /* createHttpError(404, "Blogpost Not Found"); */
        next(error);
    }
})

blogPostRouter.post("/", checkBlogSchema, checkValidationResult, async (req,res,next)=>{
    try{
        console.log(req.ip, "POST post at:", new Date());
        const newBlogPost = {...req.body, createdAt:new Date(), _id:uniqid()};
        const blogPostsArray = await getBlogPosts();  
        blogPostsArray.push(newBlogPost);
        await writeBlogPosts(blogPostsArray);
        res.status(201).send({message:`Added a new blogPost.`,_id:newBlogPost._id});
        
    }catch(error){
        next(error)
    }
})

 blogPostRouter.post("/images/:blogPostId/cover", async (req,res,next)=>{try{
    const fileName = req.params.blogPostId + extname(req.file.originalname);
    await saveBlogPostCover(fileName, req.file.buffer);
    res.status(201).send({message: "Blog Post Cover Uploaded"})
 }catch(error){next(error)}}) 


 blogPostRouter.post("/images/:blogPostId/avatar", async (req,res,next)=>{try{
    const fileName = req.params.blogPostId + extname(req.file.originalname);
    await saveBlogPostAvatars(fileName, req.file.buffer);
    res.status(201).send({message: "Avatar Uploaded"})
 }catch(error){next(error)}}) 



blogPostRouter.put("/:blogPostId", async (req,res,next)=>{
    try{
        console.log(req.ip, "PUT post at:", new Date());
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
    console.log(req.ip, "DELETE post at:", new Date());
    const blogPostsArray = await getBlogPosts();
    const remainingBlogPosts = blogPostsArray.filter(blogPost => blogPost._id !== req.params.blogPostId);
    if(blogPostsArray.length === remainingBlogPosts.length){
        res.status(404).send("Post Not Found")
    }else{
    await writeBlogPosts(remainingBlogPosts);
    res.status(204).send({message:"blogPost has been deleted."})
    }
}catch(error){
    next(error)
}
})


export default blogPostRouter;