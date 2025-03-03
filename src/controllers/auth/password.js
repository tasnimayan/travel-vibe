const crypto = require('crypto');
const User = require('../../models/user');

// ========== Password Reset Functionalities ===========
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    // returns true or false
    const isValid = await user.comparePassword(
      req.body.password,
      user.password
    );

    if (!isValid) {
      return res.status(401).send('Passwords do not match!');
    }

    user.password = req.body.newPassword;
    await user.save();

    res.status(200).send({ message: 'Updates successful!', user: req.user });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
}

// ========== Account recovery Functionalities ===========
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      throw new Error();
    }
    const resetToken = await user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });


    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/users/account/recover/${resetToken}`;

    // resetPasswordEmail(user, resetURL);

    res.status(200).send({ message: 'Token sent to email', url: resetURL });
  } catch (err) {
    res.status(404).send({ message: 'Wrong credentials!' });
  }
}

exports.resetPassword = async (req, res)=> {
  try {
    // hash the token in url
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // find user by hashed token & compare expiry
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gte: Date.now() },
    });

    if (!user) {
      return res.status(404).send({ message: 'Does not match!' });
    }
    //updating password and reset tokens
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // saving user document
    await user.save();

    // login user via JWT stored in cookies
    const token = await user.generateToken();
    res.cookie('jwt', token, cookieOptions);

    res.status(200).send({ message: 'Password updated successfully!', token });
  } catch (err) {
    res.status(400).send({ message: 'Password could not be updated' });
  }
}