const User = require('../../models/user')
const mailSender = require('../../utils/email')
const path = require('path')
const crypto = require('crypto')

// In the signUp function  => Add the email sending function when domain is purchased
// LogIn functionality is complete
// Log out functionality is complete
// User information update functionality is Complete
// User authentication is complete

// View profile functionality  completed  => yet need a modification / better coding
// Update/ Reset password    =>complete
// Forgot password    =>complete
// Cookie expiry date for Tokens


let cookieOptions = {
	expires: new Date(
		Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60_000
	),
	secure: true,
};


// ========== SignUp Functionalities ===========
exports.signUp = async (req, res)=> {
  try {
    // Create and save user to DB
    const userData = { ...req.body };
    const user = await User.create(userData);

    if (!user) {
      return res.status(400).send();
    }

    // Log user in and send jwt
    const token = await user.generateToken(user._id);
    res.cookie('jwt', token, cookieOptions);

    // Send a welcome email to a new user
    // mailSender(user, "welcome");

    res
      .status(201)
      .send({ message: 'User created successfully!', user, token });
  }
  catch (err) {
    res.status(400).send({ error: err.message });
  }
}

// ========== Login Functionalities ===========
exports.loginUser = async (req, res) =>{
  const { email, password } = req.body;

  try {
    const user = await User.loginUser(email, password);

    if (!user) {
      return res.status(401).send();
    }
    const token = await user.generateToken();
    res.cookie('jwt', token, cookieOptions);

    res.status(200).send({ message: 'Login successful', user, token });
  } catch (err) {
    res.status(401).send(err);
  }
}

// ========== Logout Functionalities ===========
module.exports.logoutUser = async (req, res) => {
  try {
    // Create fake token to cookie
    res.cookie('jwt', 'nothing', {
      expires: new Date(Date.now() + 10_000),
      httpOnly: true,
    });

    // api and db logout
    req.token = undefined;
    req.user.token = undefined;

    res.status(200).send({ message: 'Logout successful!' });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
}

// User profile functionalities
module.exports.getUser = async (req, res)=> {
  try {
    const user = req.user
    if (!user) {
      return res.status(404).send({ message: 'No user found!' });
    }

    res.status(200).send(user);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
}

// ========== User Data Update Functionalities ===========
exports.updateUser = async (req, res)=> {
  try {

    
    // handling request object
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'address', 'photo', 'role'];
    let validUpdates = {};

    // filtering updates
    updates.forEach(el => {
      if (allowedUpdates.includes(el)) {
        validUpdates[el] = req.body[el];
      }
      return validUpdates;
    });

    // saving photos
    if (req.file) {
      validUpdates.photo =req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, validUpdates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).send();
    }

    res.status(200).send({ message: 'user updated!', user });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
}

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
    console.log("====1")
    await user.save({ validateBeforeSave: false });


    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/users/account/recover/${resetToken}`;

    // resetPasswordEmail(user, resetURL);

    res.status(200).send({ message: 'Token sent to email', url: resetURL });
  } catch (err) {

    // user.resetPasswordToken = undefined;
    // user.resetPasswordExpires = undefined;
    // await user.save({ validateBeforeSave: false });
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
    
      console.log(hashedToken)

    // find user by hashed token & compare expiry
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gte: Date.now() },
    });

    if (!user) {
      return res.status(404).send({ message: 'No user found!' });
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

    // sending response object to user
    res
      .status(200)
      .send({ message: 'Password updated successfully!', token });
  } catch (err) {
    res.status(400).send({ message: 'Something went wrong' });
  }
}

// ========== Account deletion Functionalities ===========
exports.deleteUser = async (req, res) =>{
  try {
    const user = await User.findByIdAndDelete(req.user._id);

    if (!user) {
      return res.status(404).send({ message: 'No user found!' });
    }

    res.status(204).send("successful");
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
}



/*
1. User can create account         -Done
2. User can Login to account      -Done
3. User can update profile information  -Done
4. User can reset password         -Done
5. User can recover their account  -Done
6. User can delete their account   -Done


*/