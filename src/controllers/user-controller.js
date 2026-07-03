/** Requirements */
const responder = require("../utils/responder");
const userService = require("../services/user-service");
const { tokenService } = require("../services/token-service");
const ROUTES = require("../constants/routes");
const { cookieOptions } = require("../config/cookie-config");

/** Register User */
const registerUser = async (req, res, next) => {
  try {
    const uuid = await userService.registerService(req.body);
    res.cookie("uuid", uuid, cookieOptions.uuid);
    responder(
      res,
      null,
      { redirect: ROUTES.AUTH.VERIFY_EMAIL },
      200,
      `We've sent a verification code to ${req.body.email}`,
    );
  } catch (error) {
    next(error);
  }
};

/** Verifi Email */
const verifyEmail = async (req, res, next) => {
  const uuid = req.cookies.uuid;
  const verifyCode = req.body.code;
  const userAgent = req.headers["user-agent"];
  const ipAddress = req.ip;

  try {
    const { user, accessJwt, refreshToken } =
      await userService.verifyEmailService(
        uuid,
        verifyCode,
        userAgent,
        ipAddress,
      );
    res.clearCookie("uuid", cookieOptions.uuid);
    res.cookie("refreshToken", refreshToken, cookieOptions.refreshToken);
    res.set("authorization", `bearer ${accessJwt}`);
    responder(res, user, null, 201, "registeration successful");
  } catch (error) {
    next(error);
  }
};

/** Log In */
const loginUser = async (req, res, next) => {
  const userAgent = req.headers["user-agent"];
  const ipAddress = req.ip;
  try {
    const { user, refreshToken, accessJwt } = await userService.loginService(
      req.body,
      userAgent,
      ipAddress,
    );
    res.cookie("refreshToken", refreshToken, cookieOptions.refreshToken);
    res.set("authorization", `bearer ${accessJwt}`);
    responder(res, user, null, 200, "Login successful");
  } catch (error) {
    next(error);
  }
};

/** Log Out */
const logOutUser = async (req, res, next) => {
  try {
    await tokenService.revokeRefreshToken(req.cookies.refreshToken);

    res.clearCookie("refreshToken", cookieOptions.refreshToken);
    res.removeHeader("authorization");

    responder(res, null, null, 200, "Logout successful");
  } catch (error) {
    next(error);
  }
};

/** Get New Refresh Token */
const getNewRefreshToken = async (req, res, next) => {
  const userAgent = req.headers["user-agent"];
  const ipAddress = req.ip;
  const refreshToken = req.cookies.refreshToken;
  try {
    const { rotated, rawToken, accessToken } =
      await tokenService.rotateRefreshToken(refreshToken, userAgent, ipAddress);

    if (rotated && rawToken) {
      res.cookie("refreshToken", rawToken, cookieOptions.refreshToken);
      res.set("authorization", `bearer ${accessToken}`);
      return responder(res, null, null, 200, "Token rotated");
    }
    if (!rotated) {
      res.clearCookie("refreshToken", cookieOptions.refreshToken);
      res.removeHeader("authorization");

      return next(
        appError(401, "Please login", { redirect: ROUTES.AUTH.LOGIN }),
      );
    }
  } catch (error) {
    next(error);
  }
};
module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  logOutUser,
  getNewRefreshToken,
};
