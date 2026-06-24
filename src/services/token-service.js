/** Requirements */
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db-config");
const crypto = require("crypto");

/** Token Service */
class TokenService {
  constructor() {
    this.accessPrivateKey = Buffer.from(
      process.env.ACCESS_PRIVATE_KEY_BASE64,
      "base64",
    ).toString("utf8");
    this.accessPublicKey = Buffer.from(
      process.env.ACCESS_PUBLIC_KEY_BASE64,
      "base64",
    ).toString("utf8");

    this.refreshTokenHashSecret = process.env.REFRESH_TOKEN_HASH_SECRET;

    this.accessTokenExpiry = 15 * 60;
    this.refreshTokenExpiry = 7 * 24 * 60 * 60;
    this.jwtAlgorithm = process.env.JWT_ALGORITHM;
  }

  /** Generate Access JWT */
  generateAccessJwt = (user) => {
    const payload = {
      sub: user.id,
      email: user.email,
      userName: user.user_name,
      role: user.role,
      type: "access",
    };
    return jwt.sign(payload, this.accessPrivateKey, {
      algorithm: this.jwtAlgorithm,
      expiresIn: this.accessTokenExpiry,
    });
  };

  /** Generate Refresh Token */
  generateRefreshToken = () => {
    return crypto.randomBytes(32).toString("base64url");
  };

  /** Hash Token */
  hashToken = (token) => {
    return crypto
      .createHmac("sha256", this.refreshTokenHashSecret)
      .update(token)
      .digest("hex");
  };

  /** Create Refresh Session */
  createRefreshSession = async (userId, userAgent, ipAddress) => {
    const rawToken = this.generateRefreshToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + this.refreshTokenExpiry * 1000);

    const result = await pool.query(
      `INSERT INTO refresh_tokens(token_hash , user_id , expires_at, user_agent , ip_address) VALUES($1 , $2 , $3 , $4 , $5) RETURNING id`,
      [tokenHash, userId, expiresAt, userAgent, ipAddress],
    );
    return { rawToken, sessionId: result.rows[0].id };
  };
}

module.exports = { tokenService: new TokenService() };
