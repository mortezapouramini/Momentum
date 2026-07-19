const appError = require("../utils/error.util");
const { tokenService } = require("../shared/token.service");

const authAccessToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const accessJwt = authHeader ? authHeader.split(" ")[1] : null;

  if (!accessJwt) {
    return next(
      appError(401, "Invalid Token", {
        redirect: "/api/v1/auth/refresh-token",
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
        appError(401, "Token expired", {
          redirect: "/api/v1/auth/refresh-token",
        }),
      );
    }
    if (error.name === "JsonWebTokenError") {
      return next(
        appError(401, "Invalid token", {
          redirect: "/api/v1/auth/refresh-token",
        }),
      );
    }
    next(error);
  }
};

module.exports = {
  authAccessToken,
};
