const User = require("../models/user");

module.exports.isAuthorized = async (req, res, next) => {
  try {
    if (!req.headers.authorization && !req.headers.authorization?.startsWith("Bearer")) {
      return res.status(401).send({ message: "Authentication Failed" });
    }

    const token = req.headers.authorization.split(" ")[1];

    // const token = req.cookies.tvUserToken;
    const user = await User.validateToken(token);

    if (!token || !user) {
      throw new Error("user is not authenticated");
    }

    req.token = token;
    req.user = user;

    next();
  } catch (err) {
    res.status(401).send({ message: err.message });
  }
};

module.exports.isAvailableFor = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(401).send({ message: "This route is not for current user role" });
    }
    next();
  };
};

exports.optionalAuth = async (req, res, next) => {
  try {
    if (!req.headers.authorization && !req.headers.authorization?.startsWith("Bearer")) {
      return next();
    }
    const token = req.headers.authorization.split(" ")[1];

    const user = await User.validateToken(token);

    if (!token || !user) {
      throw new Error("user is not authenticated");
    }

    req.user = user;
    next();
  } catch (err) {
    next();
  }
};
