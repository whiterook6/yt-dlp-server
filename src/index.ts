import express, { Request, Response } from "express";
import { DownloaderController } from "./Controller";
import path from "path";
import fs from "fs";
import JSZip from "jszip";

const server = express();
server.get("/api/download", async (request: Request, response: Response) => {
  const url = request.query.url as string;
  if (!url){
    return response.status(400).setHeader("Content-Type", "application/json").send({
      error: "URL is required"
    });
  }

  const controller = new DownloaderController();
  let filenames: string[] = [];
  try {
    console.log(`Downloading from ${url}`);
    const files = controller.download(url);
    for await (const file of files) {
      console.log(`Downloaded ${file} from ${url}`);
      filenames.push(file);
    }
  } catch (error) {
    console.error(error);
    return response.status(500).setHeader("Content-Type", "application/json").send({
      error: "An error occurred downloading files",
      detail: error.message
    });
  };
  
  if (filenames.length === 0){
    console.log(`No files downloaded from ${url}`);
    return response.status(500).setHeader("Content-Type", "application/json").send({
      error: "No files downloaded"
    });
  }
  
  if (filenames.length === 1){
    try {
      console.log(`Sending ${filenames[0]} from ${url}`);
      return response.status(200).sendFile(path.join(__dirname, "..", filenames[0]));
    } catch (error) {
      return response.status(500).setHeader("Content-Type", "application/json").send({
        error: "An error occurred downloading the song",
        detail: error.message
      });
    }
  } else {
    let content;
    try {
      const zip = new JSZip();
      console.log(`Zipping ${filenames.length} files from ${url}`);
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
      return response.status(500).setHeader("Content-Type", "application/json").send({
        error: "An error occurred creating the zip file",
        detail: error.message
      });
    }
    
    try {
      console.log(`Sending zip file from ${url}`);
      response.setHeader("Content-Type", "application/zip");
      response.setHeader("Content-Disposition", "attachment; filename=download.zip");
      response.status(200).send(content);
      console.log(`Sent zip file from ${url}`);
    } catch (error){
      console.error(error);
      return response.status(500).setHeader("Content-Type", "application/json").send({
        error: "An error occurred downloading the zip file",
        detail: error.message
      });
    };
  }
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});