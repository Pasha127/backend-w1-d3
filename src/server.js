import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import blogPostRouter from "./blogPosts/index.js";
import errorHandler from "./errorHandler.js";
import { join } from "path"
const server = express();
const port = 3001
const publicFolderPath = join(process.cwd(), "./public");

server.use(express.static(publicFolderPath))
server.use(cors({
    "origin":"*",
    "methods":["GET","POST","PUT","DELETE"]
}));


server.use(express.json())
server.use("/blogPosts", blogPostRouter)
server.use(errorHandler)

server.listen( port, ()=>{
    console.table(listEndpoints(server))
    console.log("server is running on port:" , port)
})

server.on("error", (error)=>
console.log(`Server not running due to ${error}`)
)