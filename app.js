import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";
import { videoRouter } from "./routes/router.js";
import { errorHandler } from "./middleware/checkVideoCodec.js";

const app = express();

app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/video", videoRouter);

const PORT = 3000;
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
