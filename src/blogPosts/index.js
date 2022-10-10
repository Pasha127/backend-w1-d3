import express from "express";
import { extname} from "path";
import uniqid from "uniqid";
import { checkBlogSchema, checkValidationResult } from "./validator.js"
import { getBlogPosts, saveBlogPostAvatars, saveBlogPostCover, writeBlogPosts } from "../library/fs-tools.js";
 import multer from "multer"; 
import createHttpError from "http-errors";

const blogPostRouter = express.Router();


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
        res.status(201).send({message:`Added a new blogPost.`,_id:newBlogPost._id});
        
    }catch(error){
        next(error)
    }
})


 blogPostRouter.post("/images/:blogPostId/cover",multer().single("image"), async (req,res,next)=>{try{     
     console.log(req.file);
    const fileName = req.params.blogPostId + extname(req.file.originalname);
     console.log(fileName,req.file.buffer);
    await saveBlogPostCover(fileName, req.file.buffer);
    res.status(201).send({message: "Blog Post Cover Uploaded"})
}catch(error){next(error)}}) 


blogPostRouter.post("/images/:blogPostId/avatar",multer().single("image"), async (req,res,next)=>{try{
     console.log("tried to post an avatar");
    const fileName = req.params.blogPostId + extname(req.file.originalname);
    await saveBlogPostAvatars(fileName, req.file.buffer);
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