/** Requirements */
const responder = require("../utils/responder");
const userService = require("../services/user-service");

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
      { redirect: "api/v1/auth/verify-email" },
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

module.exports = { registerUser, verifyEmail };
