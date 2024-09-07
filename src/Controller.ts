import { spawn } from "child_process";

export class DownloaderController {
    // create an async generrator metod
  public download = async function* (url: string) {
    const command = spawn('yt-dlp', [
      "-o", "./music/%(title)s.%(ext)s",
      "--ignore-errors",
      "--format", "bestaudio",
      "--extract-audio",
      "--audio-format", "mp3",
      "--audio-quality", "128k",
      "--add-metadata",
      url
    ]);

    // handle errors
    command.stderr.on('data', (data) => {
      throw new Error(data.toString());
    });

    for await (const chunk of command.stdout) {
      yield chunk;
    }
  }
}