const appError = require("../utils/error.util");
const { tokenService } = require("../shared/token.service");

const authAccessToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const accessJwt = authHeader ? authHeader.split(" ")[1] : null;

  if (!accessJwt) {
    return next(
      appError({
        code: 401,
        message: "Invalid Token",
        details: {
          redirect: "/api/v1/auth/refresh-token",
        },
      }),
    );
  }

  try {
    const decoded = tokenService.verifyAccessJwt(accessJwt);
    delete decoded.type;
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(
        appError({
          code: 401,
          message: "Token expired",
          details: {
            redirect: "/api/v1/auth/refresh-token",
          },
        }),
      );
    }
    if (error.name === "JsonWebTokenError") {
      return next(
        appError({
          code: 401,
          message: "Invalid token",
          details: {
            redirect: "/api/v1/auth/refresh-token",
          },
        }),
      );
    }
    next(error);
  }
};

module.exports = {
  authAccessToken,
};
