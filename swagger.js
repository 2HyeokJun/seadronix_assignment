import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Video Splitter API",
      version: "1.0.0",
      description: "h.264 인코딩 영상 분할 API",
    },
  },
  apis: ["./routes/*.js"], // API 문서가 포함된 파일 경로
};

export const swaggerSpec = swaggerJSDoc(options);
