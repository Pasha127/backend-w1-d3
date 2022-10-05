import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import authorRouter from "./authors/index.js";
const server = express();
server.use(cors());
server.use(express.json())
const port = 3001

server.use(express.json())
server.use("/authors", authorRouter)

server.listen( port, ()=>{
    console.table(listEndpoints(server))
    console.log("server is running on port:" , port)
})

server.on("error", (error)=>
console.log(`Server not running due to ${error}`)
)