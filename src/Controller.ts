import { spawn } from "child_process";

export class DownloaderController {

  /** Downloads music from this URL, either one song or many, and returns a list of filenames */
  public download = async function* (url: string) {
    console.log("Downloading music from", url);
    let command;
    try {
      command = spawn('yt-dlp', [
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
      command.stderr.on("data", (data) => {
        if (data.toString().includes("unavailable video")){
          return;
        } else {
          console.error(data.toString());
        }
      });
      command.on("error", (error) => {
        console.error(error);
        return;
      });
    } catch (error) {
      console.error(error);
      return;
    }

    for await (const chunk of command.stdout) {
      const lines: string[] = chunk.toString().split("\n").filter(Boolean);
      for (const line of lines) {
        console.log(line);
        if (line.startsWith("[Metadata] Adding metadata to ")){
          const match = line.match(/\[Metadata\] Adding metadata to \"(.*)\"/);
          if (match){
            yield match[1];
          }
        }
      }
    }
  }
}