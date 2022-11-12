import passport from "passport";
import FacebookStrategy from "passport-facebook";
import authorModel from "../authors/model.js"
import { createTokens } from "./tokenTools.js";



passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `http://localhost:3000/authors/facebookRedirect`
  },
  async function(_, __, profile, passportNext) {      
    try{
/*         console.log(profile) */
         const {email, given_name, family_name, id, picture } = profile._json;
        const author = await authorModel.findOne({email});
        if(author){
            const tokens = await createTokens(author);
          
            passportNext(null,tokens);
            
        }else{
         
            const newAuthor = authorModel({firstName:given_name,lastName:family_name,email,username: id, avatar:picture});
            const createdAuthor = await newAuthor.save();
            const {accessToken} = await createTokens(createdAuthor);
           
            passportNext(null, {accessToken});
        } 
        passportNext(null, {accessToken:123});
    }catch(error){
    
        console.log(error)
        passportNext(error);
    }
  }
));export default facebookStrategy