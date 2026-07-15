const jwt = require("jsonwebtoken");

const extractToken = (authHeader) => {
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

module.exports = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ error: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    req.user = decoded;

    next();
  } catch (err) {
    console.error("JWT Authentication Error:", err.stack || err);
    return res.status(401).json({ error: "Invalid token" });
  }
};