import {
  InvalidCodecError,
  InvalidFileError,
  VideoNotFoundError,
} from "../error.js";
import {
  deleteVideoById,
  insertOriginalVideo,
  selectVideoById,
} from "../repository.js";
import { getVideoMetadata } from "../services/videoUploadService.js";
import fs from "fs";

export const checkVideoType = async (req, _, next) => {
  let { file } = req;
  if (!checkIsVideoFile(file.mimetype)) {
    await deleteWrongFile(file.path);
    throw new InvalidFileError();
  }
  let videoId = await insertOriginalVideo(file.originalname, file.filename);
  req.file = { ...file, videoId };
  next();
};

const deleteWrongFile = async (filepath, videoId = null) => {
  fs.unlink(filepath, (error) => {
    if (error) {
      console.error(error);
    }
  });
  if (videoId) {
    await deleteVideoById(videoId);
  }
};

const checkIsVideoFile = (mimetype) => {
  const ALLOWED_MIMETYPE = "video/";
  return mimetype.startsWith(ALLOWED_MIMETYPE);
};

const checkIsAllowedCodec = (streamsArray) => {
  const ALLOWED_CODEC = "h264";
  return streamsArray.some((stream) => stream.codec_name === ALLOWED_CODEC);
};

const checkIsAllowedLength = (duration) => {
  const ALLOWED_LENGTH = 60; 
  return duration >= ALLOWED_LENGTH;
};

export const checkMetadata = async (req, _, next) => {
  const metadata = await getVideoMetadata(req.file.path);
  const videoLength = metadata.format.duration;
  if (!checkIsAllowedLength(videoLength)) {
    await deleteWrongFile(req.file.path, req.file.videoId);
    throw new InvalidFileError();
  }
  if (!checkIsAllowedCodec(metadata.streams)) {
    await deleteWrongFile(req.file.path, req.file.videoId);
    throw new InvalidCodecError();
  }
  req.metadata = metadata;
  next();
};

export const checkVideoId = async (req, _, next) => {
  const { videoId } = req.params;
  const isCorrectVideoId = await checkIsCorrectVideoId(videoId);
  if (!isCorrectVideoId) {
    throw new VideoNotFoundError();
  }
  next();
};

const checkIsCorrectVideoId = async (videoId) => {
  const video = await selectVideoById(videoId);
  return video.length > 0;
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    status: "error",
    error: {
      name: err.name,
      message: err.message,
    },
  });
};
