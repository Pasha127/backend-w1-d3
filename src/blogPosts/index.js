import express, { response } from "express";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import uniqid from "uniqid";

const authorsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "blogPosts.json")

const authorRouter = express.Router();

authorRouter.get("/",(req,res)=>{
    try{
        const authors = JSON.parse(fs.readFileSync(authorsJSONPath));
        res.status(200).send(authors)
    }catch(error){
        res.status(500).send(error)
    }

})

authorRouter.get("/:authorId" , (req,res)=>{
    try{
    const authorId = req.params.authorId;
    const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));
    const foundAuthor = authorsArray.find(author => author._id === authorId);
    res.status(200).send(foundAuthor);
}catch(error){
    res.status(500).send(error)
}
})

authorRouter.post("/", (req,res)=>{
    try{
    const newAuthor = {...req.body, createdAt:new Date(), _id:uniqid()};
    const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath))
    const entryIndex = authorsArray.findIndex(author => author.email === newAuthor.email);
    if(entryIndex===-1){
        authorsArray.push(newAuthor);
        fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray));
        res.status(201).send({message:`Added a new author with an "id" of: ${newAuthor._id}`});
        
    }else{
    res.status(208).send({message:"An author with this email already exists."})}
}catch(error){
    res.status(500).send(error)
}
})

authorRouter.put("/:authorId", (req,res)=>{
    try{
    const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));
    const entryIndex = authorsArray.findIndex(author => author._id === req.params.authorId);
    const oldAuthor = authorsArray[entryIndex];    
    const updatedAuthor = {...oldAuthor, ...req.body, updatedAt:new Date()}
    authorsArray[entryIndex] = updatedAuthor;
    fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray));
    res.status(200).send(updatedAuthor)

}catch(error){
    res.status(500).send(error)
}
})

authorRouter.delete("/:authorId", (req,res)=>{try{
    const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));
    const remainingAuthors = authorsArray.filter(author => author._id !== req.params.authorId);
    fs.writeFileSync(authorsJSONPath,JSON.stringify(remainingAuthors));
    res.status(204).send({message:"Author has been deleted."})
}catch(error){
    res.status(500).send(error)
}
})

export default authorRouter;
