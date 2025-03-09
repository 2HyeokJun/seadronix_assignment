
import express from 'express'
import "express-async-errors";
import multer from 'multer'
import { checkMetadata, checkVideoType } from '../middleware/checkVideoCodec.js'
import { splitVideo } from '../services/videoUploadService.js'

const videoRouter = express.Router();
const upload = multer({ dest: 'uploads/' });

videoRouter.post('/video', upload.single('video'), checkVideoType, checkMetadata, async (req, res) => {
  const segments = await splitVideo(req.file);
    res.json({
        status: 'success',
        data: {
            segments,
        },
    });
});

export default videoRouter;
