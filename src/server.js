import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import blogPostRouter from "./blogPosts/index.js";
import {badRequestHandler, genericErrorHandler, notFoundHandler, unauthorizedHandler,} from "./errorHandlers.js"
const server = express();

server.use(cors({
    "origin":"*",
    "methods":["GET","POST","PUT","DELETE"]
}));
server.use(express.json())
const port = 3001

server.use(express.json())
server.use("/blogPosts", blogPostRouter)

server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

server.listen( port, ()=>{
    console.table(listEndpoints(server))
    console.log("server is running on port:" , port)
})

server.on("error", (error)=>
console.log(`Server not running due to ${error}`)
)