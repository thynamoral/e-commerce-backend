import HTTP_STATUS_CODE from "./httpStatus";

export const enum AppErrorCode {
  INVALID_ACCESS_TOKEN = "INVALID_ACCESS_TOKEN",
  FORBIDDEN = "FORBIDDEN",
}

class AppError extends Error {
  constructor(
    message: string,
    public statusCode: HTTP_STATUS_CODE,
    public errorCode?: AppErrorCode
  ) {
    super(message);
  }
}

export default AppError;
