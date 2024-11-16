import { spawn } from "child_process";

export class DownloaderController {

  /** Downloads music from this URL, either one song or many, and returns a list of filenames */
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
      const lines: string[] = chunk.toString().split("\n").filter(Boolean);
      for (const line of lines) {
        if (line.startsWith("[Metadata] Adding metadata to ")){
          debugger;
          const match = line.match(/\[Metadata\] Adding metadata to \"(.*)\"/);
          if (match){
            yield match[1];
          }
        }
      }
    }
  }
}