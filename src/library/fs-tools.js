import {fileURLToPath} from "url";
import {dirname,join} from "path";
import fs from "fs-extra";

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

