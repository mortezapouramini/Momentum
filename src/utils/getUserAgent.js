const getUserAgent = (req) => {
  return req.headers["user-agent"] || "Unknown";
};

module.exports = getUserAgent;