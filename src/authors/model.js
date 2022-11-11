import {Schema, model} from "mongoose";
import bcrypt from "bcrypt"


const authorDbSchema = new Schema(
    {      
        firstName: { type: String },
        lastName: { type: String },
        username: { type: String, required: true },
        password: { type: String},
        role: { type: String, enum: ["Admin", "User"], default: "User"  },
        avatar: { type: String, required: true, default: "https://placekitten.com/60/60"  },
        email: { type: String, required: true },
        refreshToken: { type: String }
    },
    {timestamps: true}
  )
  
  
  authorDbSchema.pre("save", async function (next) {
    if (this.isModified("password")) {  
      const hash = await bcrypt.hash(this.password, 11);
      this.password = hash;
    }    
    next();
  })
  
  authorDbSchema.methods.toJSON = function () {
    const author = this.toObject();  
    delete author.password;
    delete author.createdAt;
    delete author.updatedAt;
    delete author.__v;
    delete author.refreshToken;    
    return author;
  }
  
  authorDbSchema.static("checkCredentials", async function (email, plainPass) {    
    const author = await this.findOne({ email })     
    if (author) {
      const isMatch = await bcrypt.compare(plainPass, author.password);      
      if (isMatch) {
        return author;
      } else {
        return null;
      }
    } else {
      return null;
    }
  })
  

export default model("Author", authorDbSchema);