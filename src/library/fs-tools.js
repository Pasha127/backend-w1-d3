import {fileURLToPath} from "url";
import {dirname,join} from "path";
import fs from "fs-extra";

const {readJSON, writeJSON, writeFile, createReadStream, unlinkSync} = fs;

const avatarsPublicFolderPath = join(process.cwd(), "/public/img/blogs/avatars");
const coversPublicFolderPath = join(process.cwd(), "/public/img/blogs/covers");
const blogPostsJSONPath = join(process.cwd(), "/src/blogPosts/blogPosts.json");
const tempPostJSONPath = join(process.cwd(), "/src/blogPosts/tempPost.json");
export const getBlogPosts = () => readJSON(blogPostsJSONPath);
export const writeBlogPosts = (blogPostsArr) => writeJSON(blogPostsJSONPath,blogPostsArr)

export const saveBlogPostAvatars = (fileName, contentAsABuffer) => writeFile(join(avatarsPublicFolderPath, fileName), contentAsABuffer)
export const saveBlogPostCover = (fileName, contentAsABuffer) => writeFile(join(coversPublicFolderPath, fileName), contentAsABuffer)
export const getPdfTextReadStream = async (id) =>{
        const blogPostId = id;
        const blogPostsArray = await getBlogPosts();
        const foundBlogPost = await blogPostsArray.find(blogPost =>blogPost._id === blogPostId)
        await writeJSON(tempPostJSONPath,foundBlogPost)        
        return createReadStream(tempPostJSONPath)
}
export const deleteTempJSON = () => unlinkSync(tempPostJSONPath)
    

