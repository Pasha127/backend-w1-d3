import express from "express";
import listEndpoints from "express-list-endpoints";
import authorRouter from "./api/index.js";

const server = express();
const port = 3001

server.use(express.json())

server.use("/authors", authorRouter)

server.listen( port, ()=>{
    console.table(listEndpoints(server))
    console.log("server is running on port:" , port)
})