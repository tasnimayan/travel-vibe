const mongoose = require("mongoose");

const cookieOptions = {
	expires: new Date(
		Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60_000
	),
  secure: true,  // Only sent over HTTPS
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
}

module.exports = {
  cookieOptions,
  isValidObjectId,
};
