import express, { Request, Response } from "express";
import { DownloaderController } from "./Controller";
import path from "path";
import fs from "fs";
import JSZip from "jszip";

const server = express();
server.get("/api/download", async (request: Request, response: Response) => {
  const sendError = (errorCode: number, message: string, detail?: string) => {
    return response.status(errorCode).setHeader("Content-Type", "application/json").send({
      error: message,
      detail: detail
    });
  }

  const url = request.query.url as string;
  if (!url){
    return sendError(400, "URL is required");
  }

  const controller = new DownloaderController();
  let filenames: string[] = [];
  try {
    const files = controller.download(url);
    for await (const file of files) {
      filenames.push(file);
    }
  } catch (error) {
    console.error(error);
    return sendError(500, "An error occurred downloading files");
  };
  
  if (filenames.length === 0){
    return sendError(500, "No files downloaded");
  }
  
  if (filenames.length === 1){
    try {
      return response.status(200).sendFile(path.join(__dirname, "..", filenames[0]));
    } catch (error) {
      return sendError(500, "An error occurred downloading the song or songs");
    }
  } else {
    let content;
    try {
      const zip = new JSZip();
      for (const filename of filenames){
        zip.file(filename, fs.readFileSync(path.join(__dirname, "..", filename)));
      }

      content = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: {
          level: 9
        }
      });
    } catch (error) {
      console.error(error);
      return sendError(500, "An error occurred creating the zip file", error.message);
    }
    
    try {
      response.setHeader("Content-Type", "application/zip");
      response.setHeader("Content-Disposition", "attachment; filename=download.zip");
      response.status(200).send(content);
    } catch (error){
      console.error(error);
      return sendError(500, "An error occurred downloading the zip file",error.message);
    };
  }
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
