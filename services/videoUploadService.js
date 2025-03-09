import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import fs from "fs";
import path from "path";
import { insertSplitVideo, selectSplitVideos } from "../repository.js";

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

export const getVideoMetadata = async (filePath) => {
  const metadata = await new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (error, metadata) => {
      if (error) {
        return reject(error);
      }
      resolve(metadata);
    });
  });

  return metadata;
};

export const splitVideo = async (file) => {
  const inputPath = file.path;
  const originalVideoId = file.videoId;
  const fileExtension = "mp4";
  const originalFileName = path.basename(inputPath);
  const splitVideoDirectory = path.join("uploads", "splits");

  return new Promise((resolve, reject) => {
    const outputPattern = path.join(
      splitVideoDirectory,
      `${originalFileName}_split_%03d.${fileExtension}`
    );
    ffmpeg(inputPath)
      .outputOptions([
        "-c",
        "copy",
        "-map",
        "0",
        "-f",
        "segment",
        "-segment_time",
        "10",
        "-segment_format",
        "mp4",
        "-reset_timestamps",
        "1",
        "-break_non_keyframes",
        "1",
      ])
      .output(outputPattern)
      .on("end", () => {
        fs.readdir(splitVideoDirectory, async (error, files) => {
          if (error) return reject(error);
          const splitVideos = files
            .filter(
              (file) =>
                file.startsWith(`${originalFileName}_split_`) &&
                file.endsWith(fileExtension)
            )
            .map((file) => path.join(splitVideoDirectory, file));

          for (const file of splitVideos) {
            const splitNumber = parseInt(file.match(/split_(\d+)\./)[1], 10);
            await insertSplitVideo(originalVideoId, splitNumber, file);
          }

          resolve({ videoId: originalVideoId, splitVideos });
        });
      })
      .on("error", (error, stdout, stderr) => {
        console.error("동영상 분할 중 오류 발생:", error);
        console.error("ffmpeg stderr:", stderr);
        reject(error);
      })
      .run();
  });
};

export const findSplittedVideos = async (videoId, starts_at, ends_at) => {
  let minSplitId;
  let maxSplitId;
  if (starts_at) {
    minSplitId = calculateSplitNumber(starts_at);
  }
  if (ends_at) {
    maxSplitId = calculateSplitNumber(ends_at);
  }
  const splitVideoArray = await selectSplitVideos({
    videoId,
    minSplitId,
    maxSplitId,
  });
  return splitVideoArray;
};

const calculateSplitNumber = (second) => {
  return Math.floor(second / 10);
};
