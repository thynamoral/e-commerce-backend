import assert from "node:assert";
import AppError, { AppErrorCode } from "./appError";
import HTTP_STATUS_CODE from "./httpStatus";

type AssertAppError = (
  condition: any,
  message: string,
  statusCode: HTTP_STATUS_CODE,
  errorCode?: AppErrorCode
) => asserts condition;

/**
 * Asserts the given condition and throw an error if it is falsy.
 */
const assertAppError: AssertAppError = (
  condition,
  message,
  statusCode,
  errorCode
) => {
  assert(condition, new AppError(message, statusCode, errorCode));
};
