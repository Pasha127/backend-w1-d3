import {Schema, model} from "mongoose";

const blogDbSchema = new Schema(
    {
      category: { type: String, required: true },
      title: { type: String, required: true },
      cover: { type: String, required: true },
      content: { type: String, required: true },
      author: {
        name: { type: String },
        avatar: { type: String },
        email: { type: String },
      },
      readTime: {
        value: { type: String },
        unit: { type: String },
      }
    },
    {timestamps: true}
  )
  
  export default model("BlogPost", blogDbSchema)