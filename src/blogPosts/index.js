import express, { response } from "express";
import fs from "fs-extra";
import { dirname, extname, join } from "path";
import { fileURLToPath } from "url";
import uniqid from "uniqid";
import createHttpError from "http-errors"
import { checkBlogSchema, checkValidationResult } from "./validator.js"
import multer from "multer";


const blogPostRouter = express.Router();

const blogPostsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "blogPosts.json")
const getBlogPosts = () => JSON.parse(fs.readFileSync(blogPostsJSONPath))
const writeBlogPosts = (blogPostsArr) => fs.writeFileSync(blogPostsJSONPath, JSON.stringify(blogPostsArr))


blogPostRouter.get("/",(req,res,next)=>{
    try{
        const blogPosts = getBlogPosts();
        res.status(200).send(blogPosts)
    }catch(error){
        /* console.log(error);
        res.status(500).send({message:"error in get", error: error}) */
        next(error)
    }

})

blogPostRouter.get("/:blogPostId" , (req,res,next)=>{
    try{
    const blogPostId = req.params.blogPostId;
    const blogPostsArray = getBlogPosts();
    const foundBlogPost = blogPostsArray.find(blogPost =>blogPost._id === blogPostId)
    res.status(200).send(foundBlogPost);
}catch(error){
   /*  res.status(500).send(error) */
   next(error)
}
})

blogPostRouter.post("/", checkBlogSchema, checkValidationResult, (req,res,next)=>{
    try{
    const newBlogPost = {...req.body, createdAt:new Date(), _id:uniqid()};
    const blogPostsArray = getBlogPosts();  
        blogPostsArray.push(newBlogPost);
        writeBlogPosts(blogPostsArray);
        res.status(201).send({message:`Added a new blogPost with an "id" of: ${newBlogPost._id}`});

}catch(error){
   /*  res.status(500).send(error) */
   next(error)
}
})

blogPostRouter.put("/:blogPostId", (req,res,next)=>{
    try{
    const blogPostsArray = getBlogPosts();
    const entryIndex = blogPostsArray.findIndex(blogPost => blogPost._id === req.params.blogPostId);
    const oldBlogPost = blogPostsArray[entryIndex];    
    const updatedBlogPost = {...oldBlogPost, ...req.body, updatedAt:new Date()}
    blogPostsArray[entryIndex] = updatedBlogPost;
    writeBlogPosts(blogPostsArray);
    res.status(200).send(updatedBlogPost)

}catch(error){
    /* res.status(500).send(error) */
    next(error)
}
})

blogPostRouter.delete("/:blogPostId", (req,res,next)=>{try{
    const blogPostsArray = getBlogPosts();
    const remainingBlogPosts = blogPostsArray.filter(blogPost => blogPost._id !== req.params.blogPostId);
    writeBlogPosts(remainingBlogPosts);
    res.status(204).send({message:"blogPost has been deleted."})
}catch(error){
    /* res.status(500).send(error) */
    next(error)
}
})

export default blogPostRouter;
