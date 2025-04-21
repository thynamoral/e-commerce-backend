import { RequestHandler } from "express";
import { assertAppError } from "../utils/assertAppError";
import { UNAUTHORIZED } from "../utils/httpStatus";
import { verifyToken } from "../utils/jwt";
import { AppErrorCode } from "../utils/appError";

const authenticate: RequestHandler = (req, res, next) => {
  // check if accessToken is exists in cookies
  const accessToken = req.cookies.accessToken as string | undefined;
  assertAppError(accessToken, "Access token is required", UNAUTHORIZED);

  // verify accessToken
  const { decodedPayload, error } = verifyToken(accessToken);
  assertAppError(
    decodedPayload,
    `${error === "jwt expired" ? "Session expired" : "Invalid accessToken"}`,
    UNAUTHORIZED,
    AppErrorCode.INVALID_ACCESS_TOKEN
  );

  // set user_id, session_id, role in request
  req.user_id = decodedPayload.user_id;
  req.session_id = decodedPayload.session_id;
  req.role = decodedPayload.role;

  next();
};

export default authenticate;
