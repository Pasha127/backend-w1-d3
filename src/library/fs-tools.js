import {dirname,join} from "path";
import fs from "fs-extra";
import sgMail from "@sendgrid/mail"
sgMail.setApiKey(process.env.SENDGRID_KEY)
const {readJSON, writeJSON, writeFile, createReadStream, unlink} = fs;

const avatarsPublicFolderPath = join(process.cwd(), "/public/img/blogs/avatars");
const coversPublicFolderPath = join(process.cwd(), "/public/img/blogs/covers");
const blogPostsJSONPath = join(process.cwd(), "/src/blogPosts/blogPosts.json");
const tempPostJSONPath = join(process.cwd(), "/src/blogPosts/tempPost.json");
export const getBlogPosts = () => readJSON(blogPostsJSONPath);
export const writeBlogPosts = (blogPostsArr) => writeJSON(blogPostsJSONPath,blogPostsArr)

export const saveBlogPostAvatars = (fileName, contentAsABuffer) => writeFile(join(avatarsPublicFolderPath, fileName), contentAsABuffer)
export const saveBlogPostCover = (fileName, contentAsABuffer) => writeFile(join(coversPublicFolderPath, fileName), contentAsABuffer)
export const getPdfTextReadStream = async (id) =>{        
        const blogPostsArray = await getBlogPosts();
        const foundBlogPost = blogPostsArray.find(blogPost =>blogPost._id === id)        
        /*  fs.open(tempPostJSONPath, "w") */
        await writeJSON(tempPostJSONPath, foundBlogPost)
        console.log(await readJSON(tempPostJSONPath), "read written")                
        return createReadStream(tempPostJSONPath)
}
export const deleteTempJSON = () => unlink(tempPostJSONPath)

export const getCSVReadStream = () => {
       return createReadStream(blogPostsJSONPath)
}

export const sendEmail = async (recipientEmail,post) => {
        const msg = {
          to: recipientEmail,
          from: process.env.SENDER_EMAIL,
          subject: `Hello ${post.author.name}!`,
          text: `Hello ${post.author.name}!`,
          html: `<h1>Hello ${post.author.name}!</h1>`,
         /*  attachments: [
                {
                  content: attachment,
                  filename: `${post.title}.pdf`,
                  type: "application/pdf",
                  disposition: "attachment"
                }
              ] */
        }
      
        await sgMail.send(msg)
      }

export const updateEntryCover = async (id,path)=> {
        const blogPostsArray = await getBlogPosts();
     const entryIndex = blogPostsArray.findIndex(blogPost => blogPost._id === id);
     const oldBlogPost = blogPostsArray[entryIndex];    
     const updatedBlogPost = {...oldBlogPost, cover: path, updatedAt:new Date()}
     blogPostsArray[entryIndex] = updatedBlogPost;
     await writeBlogPosts(blogPostsArray);
}
export const updateEntryAvatar = async (id,path)=> {
        const blogPostsArray = await getBlogPosts();
     const entryIndex = blogPostsArray.findIndex(blogPost => blogPost._id === id);
     const oldBlogPost = blogPostsArray[entryIndex];    
     const updatedBlogPost = {...oldBlogPost, author:{...oldBlogPost.author,avatar: path}, updatedAt:new Date()}
     blogPostsArray[entryIndex] = updatedBlogPost;
     await writeBlogPosts(blogPostsArray);
}