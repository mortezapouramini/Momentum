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

  /**
   * Verify user login
   * Use in auth middleware
   */
  verifyAccessJwt = (token) => {
    return jwt.verify(token, this.accessPublicKey, {
      algorithms: [this.jwtAlgorithm],
    });
  };

  /** Verify Refresh Token */
  verifyRefreshToken = async (rawToken) => {
    if (!rawToken || typeof rawToken !== "string") {
      return { valid: false, reason: REASONS.INVALID_TOKEN };
    }

    const tokenHash = this.hashToken(rawToken);

    let result;

    result = await pool.query(
      `SELECT id, user_id, revoked_at, expires_at
           FROM refresh_tokens
           WHERE token_hash = $1`,
      [tokenHash],
    );

    if (result.rowCount === 0) {
      return { valid: false, reason: REASONS.TOKEN_NOT_FOUND };
    }

    const row = result.rows[0];

    if (row.revoked_at !== null) {
      return {
        valid: false,
        reason: REASONS.SESSION_REVOKED,
        sessionId: row.id,
        userId: row.user_id,
      };
    }

    if (new Date(row.expires_at) < new Date()) {
      return {
        valid: false,
        reason: REASONS.SESSION_EXPIRED,
        sessionId: row.id,
        userId: row.user_id,
      };
    }

    return { valid: true, sessionId: row.id, userId: row.user_id };
  };

  /** Revoke Refresh JWT */
  revokeRefreshToken = async (rawToken) => {
    const result = await this.verifyRefreshToken(rawToken);

    if (result.valid) {
      await pool.query(
        `UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL`,
        [result.sessionId],
      );
      return;
    }
  };

  /** Revoke All User Sessions */
  revokeAllSessionsForUser = async (userId) => {
    await pool.query(
      `UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId],
    );
  };

  /** Rotate Refresh Token  */
  rotateRefreshToken = async (rawToken, userAgent, ipAddress) => {
    const result = await this.verifyRefreshToken(rawToken);

    if (!result.valid) {
      // یه توکن revoke‌شده دوباره استفاده شده => سیگنال سرقت توکن
      if (
        result.reason === REASONS.SESSION_REVOKED ||
        (result.reason === REASONS.SESSION_EXPIRED && result.userId)
      ) {
        await this.revokeAllSessionsForUser(result.userId);
      }
      return { rotated: false, reason: result.reason };
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const newRawToken = this.generateRefreshToken();
      const newTokenHash = this.hashToken(newRawToken);
      const expiresAt = new Date(Date.now() + this.refreshTokenExpiry * 1000);

      const insertResult = await client.query(
        `INSERT INTO refresh_tokens(token_hash, user_id, expires_at, user_agent, ip_address)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [newTokenHash, result.userId, expiresAt, userAgent, ipAddress],
      );
      const newSessionId = insertResult.rows[0].id;

      await client.query(
        `UPDATE refresh_tokens
         SET revoked_at = now(), replaced_by = $1
         WHERE id = $2 AND revoked_at IS NULL`,
        [newSessionId, result.sessionId],
      );

      await client.query("COMMIT");

      return {
        rotated: true,
        rawToken: newRawToken,
        sessionId: newSessionId,
        userId: result.userId,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  };
}

module.exports = { tokenService: new TokenService() };
