import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import authorModel from "../authors/model.js"
import { createTokens } from "./tokenTools.js";

const googleStrategy = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `http://localhost:3000/authors/googleRedirect`
    //callbackURL: `${process.env.SERVER_URL}/authors/googleRedirect`
},async (_, __, profile, passportNext)=>  {
    //(accessToken, refreshToken, profile, cb)
   
    try{
        const {email, given_name, family_name, sub, picture } = profile._json;
        const author = await authorModel.findOne({email});
        if(author){
            const tokens = await createTokens(author);
          
            passportNext(null,tokens);
            
        }else{
         
            const newAuthor = authorModel({firstName:given_name,lastName:family_name,email,username: sub, avatar:picture});
            const createdAuthor = await newAuthor.save();
            const {accessToken} = await createTokens(createdAuthor);
           
            passportNext(null, {accessToken});
        }
    }catch(error){
    
        console.log(error)
        passportNext(error);
    }
});

export default googleStrategy