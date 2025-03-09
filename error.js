export class VideoError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "VideoError";
    this.statusCode = statusCode;
  }
}

export class InvalidFileError extends VideoError {
  constructor(message = "Invalid file", statusCode = 400) {
    super(message, statusCode);
    this.name = "InvalidFileError";
  }
}

export class InvalidCodecError extends VideoError {
  constructor(message = "Wrong codec", statusCode = 400) {
    super(message, statusCode);
    this.name = "InvalidCodecError";
  }
}

export class VideoNotFoundError extends VideoError {
  constructor(message = "Video Not Found", statusCode = 404) {
    super(message, statusCode);
    this.name = "VideoNotFoundError";
  }
}
