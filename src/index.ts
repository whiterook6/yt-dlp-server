import express, { Request, Response } from "express";
import { DownloaderController } from "./Controller";

const server = express();
server.get("/", async (request: Request, response: Response) => {
  response.status(200);
  const controller = new DownloaderController();
  const downloadOutput = controller.download("https://soundcloud.com/auvicmusic/sets/voices-call-remastered");
  for await (const chunk of downloadOutput) {
    response.write(chunk);
  }
  return response.end();
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});