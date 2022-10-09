import {fileURLToPath} from "url";
import {dirname,join} from "path";
import fs from "fs-extra";

const {readJSON, writeJSON, writeFile} = fs;

const avatarsPublicFolderPath = join(process.cwd(), "/public/img/blogs/avatars");
const coversPublicFolderPath = join(process.cwd(), "/public/img/blogs/covers");
const blogPostsJSONPath = join(process.cwd(), "/src/blogPosts/blogPosts.json");
export const getBlogPosts = () => readJSON(blogPostsJSONPath);
export const writeBlogPosts = (blogPostsArr) => writeJSON(blogPostsJSONPath,blogPostsArr)

export const saveBlogPostAvatars = (fileName, contentAsABuffer) => writeFile(join(avatarsPublicFolderPath, fileName), contentAsABuffer)
export const saveBlogPostCover = (fileName, contentAsABuffer) => writeFile(join(coversPublicFolderPath, fileName), contentAsABuffer)