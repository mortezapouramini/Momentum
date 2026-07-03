/** Requirements */
const responder = require("../utils/responder");
const userService = require("../services/user-service");
const { tokenService } = require("../services/token-service");

/** Register User */
const registerUser = async (req, res, next) => {
  try {
    const uuid = await userService.registerService(req.body);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 5 * 60 * 1000,
    };
    res.cookie("uuid", uuid, cookieOptions);
    responder(
      res,
      null,
      { redirect: "/api/v1/auth/verify-email" },
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
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie("refreshToken", refreshToken, cookieOptions);
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

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie("refreshToken", refreshToken, cookieOptions);
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

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };
    res.clearCookie("refreshToken", cookieOptions);
    res.clearCookie("uuid", cookieOptions);
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
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    if (rotated && rawToken) {
      res.cookie("refreshToken", rawToken, cookieOptions);
      res.set("authorization", `bearer ${accessToken}`);
      return responder(res, null, null, 200, "Token rotated");
    }
    if (!rotated) {
      res.clearCookie("refreshToken", cookieOptions);
      res.clearCookie("uuid", cookieOptions);
      res.removeHeader("authorization");

      return next(
        appError(400, "Please login", { redirect: "/api/v1/auth/login" }),
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
