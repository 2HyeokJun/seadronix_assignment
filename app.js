import express from 'express';
import swaggerUi from 'swagger-ui-express';
import {swaggerSpec} from './swagger.js';

const app = express();

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
