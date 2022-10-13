import PdfPrinter from "pdfmake";
import { getBlogPosts } from "./fs-tools.js";
import fs from "fs-extra";
import imageToBase64 from "image-to-base64";
