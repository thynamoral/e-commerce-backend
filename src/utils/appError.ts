import HTTP_STATUS_CODE from "./httpStatus";

export const enum AppErrorCode {
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
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
