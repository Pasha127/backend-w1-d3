import express, { response } from "express";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import uniqid from "uniqid";

const authorsJSONPath = join(dirname(fileURLToPath(import.meta.url)),authors.json)

const authorRouter = express.Router();

authorRouter.get("/",(req,res)=>{
    const allContent = fs.readFileSync(authorsJSONPath);
    const authors = JSON.parse(allContent);
    response.status(200).send(authors)
})

authorRouter.get("/:authorId" , (req,res)=>{
    const authorId = req.params.authorId;
    const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));
    const foundAuthor = authorsArray.find(author => author.id === authorId);
    response.status(200).send(foundAuthor);
})

authorRouter.post("/", (req,res)=>{
    const newAuthor = {...req.body, createdAt:new Date(), id:uniqid()};
    const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath))
    authorsArray.push(newAuthor);
    fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray));
    response.status(201).send(`Added a new author with an "id" of: ${newAuthor.id}`);
})

authorRouter.put("/:authorId", (req,res)=>{
    const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));
    const entryIndex = authorsArray.findIndex(author => author.id === req.params.authorId);
    const oldAuthor = authorsArray[entryIndex];
    if(oldAuthor.email=== req.body.email){
        response.status(208).send("An author with this email already exists.")
    }else{
        const updatedAuthor = {...oldAuthor, ...req.body, updatedAt:new Date()}
        authorsArray[entryIndex] = updatedAuthor;
        fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray));
        response.status(201).send(`The author has ben updated:`, updatedAuthor)
    }
})

authorRouter.delete("/:authorId", (req,res)=>{
    const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPath));
    const remainingAuthors = authorsArray.filter(author => author.id !== req.params.authorId);
    fs.writeFileSync(authorsJSONPath,JSON.stringify(remainingAuthors));
    response.status(204).send("Author has been deleted.")
})

