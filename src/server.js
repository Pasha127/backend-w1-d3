import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import blogPostRouter from "./blogPosts/index.js";
import errorHandler from "./errorHandler.js";
import { join } from "path"
const server = express();
const port = process.env.PORT || 3001
const publicFolderPath = join(process.cwd(), "./public");
const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]

/* import dotenv from 'dotenv'
dotenv.config()
 */
server.use(express.static(publicFolderPath))
server.use(
  cors({
    "origin": /* (origin, corsNext) => {    
      if (!origin || whitelist.indexOf(origin) !== -1) {        
        corsNext(null,true)
      } else {        
        corsNext(
          createHttpError(400, `CORS error!${origin} is not permitted!`
          )
        )
      }
    } */"*","methods":["GET","POST","PUT","DELETE"]
  })
)
server.use(express.json())
server.use("/blogPosts", blogPostRouter)
// server.use(errorHandler)

server.listen( port, ()=>{
    console.table(listEndpoints(server))
    console.log("server is running on port:" , port)
})

server.on("error", (error)=>
console.log(`Server not running due to ${error}`)
)