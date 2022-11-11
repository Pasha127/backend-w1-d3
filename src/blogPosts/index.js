import express, { json } from "express";
import { checkBlogSchema, checkValidationResult } from "./validator.js"
import { deleteTempJSON, getBlogPosts, getPdfTextReadStream, writeBlogPosts, getCSVReadStream, sendEmail, updateEntryCover, updateEntryAvatar } from "../library/fs-tools.js";
 import multer from "multer"; 
import createHttpError from "http-errors";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import blogModel from "./model.js";
import q2m from "query-to-mongo";
import json2csv from "json2csv";
import { pipeline } from "stream";
const localEndpoint=`${process.env.LOCAL_URL}${process.env.PORT}/blogPosts`
const serverEndpoint= `${process.env.SERVER_URL}/blogPosts`


const cloudinaryUploader = multer({
    storage: new CloudinaryStorage({
      cloudinary, 
      params: {folder: "BlogPics"},
    }),
    limits: { fileSize: 1024 * 1024 },
  }).single("image")

const blogPostRouter = express.Router();

/* blogPostRouter.get("/:blogPostId/json", async (req, res, next) => {
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
      console.log(error)
      next(error)
    }
  }) */

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
      console.log(error)
      next(error)
    }
  })
  
 

blogPostRouter.get("/", async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "GET posts at:", new Date());
        const mongoQuery = q2m.apply(req.query);
        const total = await blogModel.countDocuments(mongoQuery.criteria);
        const blogs = await blogModel.find(
          mongoQuery.criteria,
          mongoQuery.options.fields
        )
        .sort(mongoQuery.options.sort)
        .skip(mongoQuery.options.skip)
        .limit(mongoQuery.options.limit)
        res.status(200).send({
          links:mongoQuery.links(localEndpoint,total),
          total,
          totalPages: Math.ceil(total/mongoQuery.options.limit), 
          blogs
        })        
    }catch(error){ 
        next(error)
    }    
})


blogPostRouter.get("/:blogPostId" , async (req,res,next)=>{
    try{
        console.log(req.headers.origin, "GET post at:", new Date());       
        const foundBlogPost = await blogModel.findById(req.params.blogPostId)       
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
        const newPost = new blogModel(req.body);
        const{_id}= await newPost.save();

        res.status(201).send({message:`Added a new blogPost.`,_id});
        
    }catch(error){
      console.log(error)
        next(error);
    }
})

 blogPostRouter.post("/images/:blogPostId/cover",cloudinaryUploader, async (req,res,next)=>{try{     
     console.log("tried to post a cover", req.file.path);
     const foundBlogPost = await blogModel.findByIdAndUpdate(req.params.blogPostId,
      {cover:req.file.path},
      {new:true,runValidators:true});
    
    res.status(201).send({message: "Blog Post Cover Uploaded"});
}catch(error){ next(error) }});





blogPostRouter.put("/:blogPostId", async (req,res,next)=>{
    try{ const updatedBlogPost = await blogModel.findByIdAndUpdate(req.params.blogPostId,
      {...req.body},
      {new:true,runValidators:true});
        console.log(req.headers.origin, "PUT post at:", new Date());
        
        res.status(200).send(updatedBlogPost);
        
    }catch(error){ 
      console.log(error)
        next(error);
    }
})


blogPostRouter.delete("/:blogPostId", async (req,res,next)=>{try{
    console.log(req.headers.origin, "DELETE post at:", new Date());
     const deletedBlogPost =  await blogModel.findByIdAndDelete(req.params.blogPostId)      
    if(deletedBlogPost){
      res.status(204).send({message:"blogPost has been deleted."})
    }else{
      next(createHttpError(404, "Blogpost Not Found"));    
    }
}catch(error){
    next(error)
}
})


export default blogPostRouter;