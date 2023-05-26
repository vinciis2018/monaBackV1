import ffmpegStatic from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(ffmpegStatic);

ffmpeg()
  .input("../mediaFiles/images/frame-001.png")
  .loop("5")
  .inputOptions("-framerate", "30")
  .videoCodec("libx264")
  .outputOptions("-pix_fmt", "yuv420p")
  .saveToFile("../mediaFiles/videos/video.mp4")
  .on("progress", (progress) => {
    if (progress.percent) {
      console.log( `processing: ${Math.floor(progress.percent)}% done`)
    }
  })
  .on("end", () => {
    console.log("FFmpeg has finished");
  })
  .on("error", (error) => {
    console.error(error);
  });