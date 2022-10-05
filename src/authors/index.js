import express, { response } from "express";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import uniqid from "uniqid";

const authorsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "authors.json")

const authorRouter = express.Router();

authorRouter.get("/",(req,res,next)=>{
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
    const foundAuthor = authorsArray.find(author => author.id === authorId);
    res.status(200).send(foundAuthor);
}catch(error){
    res.status(500).send(error)
}
})

authorRouter.post("/", (req,res)=>{
    try{
    const newAuthor = {...req.body, createdAt:new Date(), id:uniqid()};
    const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath))
    authorsArray.push(newAuthor);
    fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray));
    res.status(201).send(`Added a new author with an "id" of: ${newAuthor.id}`);
}catch(error){
    res.status(500).send(error)
}
})

authorRouter.put("/:authorId", (req,res)=>{
    try{
    const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));
    const entryIndex = authorsArray.findIndex(author => author.id === req.params.authorId);
    const oldAuthor = authorsArray[entryIndex];
    if(oldAuthor.email=== req.body.email){
        res.status(208).send("An author with this email already exists.")
    }else{
        const updatedAuthor = {...oldAuthor, ...req.body, updatedAt:new Date()}
        authorsArray[entryIndex] = updatedAuthor;
        fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray));
        res.status(201).send(`The author has ben updated:`, updatedAuthor)
    }
}catch(error){
    res.status(500).send(error)
}
})

authorRouter.delete("/:authorId", (req,res)=>{try{
    const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));
    const remainingAuthors = authorsArray.filter(author => author.id !== req.params.authorId);
    fs.writeFileSync(authorsJSONPath,JSON.stringify(remainingAuthors));
    res.status(204).send("Author has been deleted.")
}catch(error){
    res.status(500).send(error)
}
})

export default authorRouter;
