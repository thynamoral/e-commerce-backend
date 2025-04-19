import { ErrorRequestHandler } from "express";
import { INTERNAL_SERVER_ERROR } from "./httpStatus";
import AppError from "./appError";

const errorHandlder: ErrorRequestHandler = (error, req, res, next) => {
  console.error(error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
  }
};

export default errorHandlder;
