import { ErrorRequestHandler, Response } from "express";
import { ZodError } from "zod";
import AppError from "./appError";
import { BAD_REQUEST } from "./httpStatus";

const zodErrorHandler = (error: ZodError, res: Response) => {
  const isInvalid_uuid = error.issues.some(
    (issue) => issue.message === "Invalid uuid"
  );
  if (isInvalid_uuid) {
    res.status(BAD_REQUEST).json({ message: "Invalid uuid" });
  }

  const errors = error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
  res.status(BAD_REQUEST).json(errors);
};

const errorHandlder: ErrorRequestHandler = (error, req, res, next) => {
  console.error(error);

  if (error instanceof ZodError) {
    zodErrorHandler(error, res);
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
    });
  }
};

export default errorHandlder;
