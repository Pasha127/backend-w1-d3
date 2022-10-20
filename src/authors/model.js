import {Schema, model} from "mongoose";

const authorDbSchema = new Schema(
    {      
      author: {
        name: { type: String },
        avatar: { type: String },
        email: { type: String },
      }
    },
    {timestamps: true}
  )
  
  export default model("Author", authorDbSchema)