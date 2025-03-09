import express from "express";
import "express-async-errors";
import multer from "multer";
import {
  checkMetadata,
  checkVideoId,
  checkVideoType,
} from "../middleware/checkVideoCodec.js";
import {
  findSplittedVideos,
  splitVideo,
} from "../services/videoUploadService.js";

export const videoRouter = express.Router();
const upload = multer({ dest: "uploads/" });

/**
 * @swagger
 * /video/upload:
 *   post:
 *     summary: 비디오 업로드 및 분할
 *     description: 비디오 파일을 업로드하면 파일을 저장하고 10초 단위로 분할한 뒤, 분할한 내역을 보여줍니다.
 *     tags:
 *       - 비디오 저장
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 비디오 파일
 *     responses:
 *       '200':
 *         description: 비디오 분할 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     videoId:
 *                       type: string
 *                       description: 원본 비디오 ID
 *                     splitVideos:
 *                       type: array
 *                       items:
 *                         type: string
 *                         description: 분할된 비디오 파일 경로
 *       '400':
 *         description: 잘못된 비디오 파일 형식(비디오 파일이 아닌 경우)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "InvalidFileError"
 *                     message:
 *                       type: string
 *                       example: "Invalid file"
 */
videoRouter.post(
  "/upload",
  upload.single("video"),
  checkVideoType,
  checkMetadata,
  async (req, res) => {
    const segments = await splitVideo(req.file);
    res.json({
      status: "success",
      data: segments,
    });
  }
);

/**
 * @swagger
 * /video/{videoId}/clips:
 *   get:
 *     summary: 분할된 클립 조회
 *     description: 특정 시간 범위의 분할된 클립들을 조회합니다
 *     tags:
 *       - 비디오 클립 조회
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: 원본 비디오 ID
 *       - in: query
 *         name: starts_at
 *         schema:
 *           type: number
 *         description: 시작 시간 (초 단위)
 *       - in: query
 *         name: ends_at
 *         schema:
 *           type: number
 *         description: 종료 시간 (초 단위)
 *     responses:
 *       '200':
 *         description: 클립 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       video_splitted_id:
 *                         type: integer
 *                         description: 분할 영상 ID
 *                       file_path:
 *                         type: string
 *                         description: 분할된 영상 파일 경로
 *       '404':
 *         description: 비디오를 찾을 수 없음(잘못된 videoId)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "VideoNotFoundError"
 *                     message:
 *                       type: string
 *                       example: "Video Not Found"
 
 */
videoRouter.get("/:videoId/clips", checkVideoId, async (req, res) => {
  const { videoId } = req.params;
  const { starts_at, ends_at } = req.query;
  const splitVideos = await findSplittedVideos(videoId, starts_at, ends_at);

  res.json({
    status: "success",
    data: splitVideos,
  });
});
