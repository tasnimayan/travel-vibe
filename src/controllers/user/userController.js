const User = require('../../models/user')
const crypto = require('crypto')
const mongoose = require('mongoose')
const EmailSend = require('../../utils/mailSender')


/*
1. User can create account         -Done
2. User can Login to account      -Done
3. User can update profile information  -Done
4. User can reset password         -Done
5. User can recover their account  -Done
6. User can delete their account   -Done

*/

// In the signUp function  => Add the email sending function when domain is purchased

let cookieOptions = {
	expires: new Date(
		Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60_000
	),
	secure: true,
};

// complete
const userOTPService = async (email) => {
  try {
    let code = Math.floor(100000 + Math.random() * 900000);
    let emailText = `<h3>Please confirm your sign-up request</h3> </br></br>
    To verify your account, please use the following code to enable your new device — it will expire in 30 minutes: </br> <h3>${code} </h3>`;
    let emailSubject = "Verification | Travel Vibe";
    await EmailSend(email, emailText, emailSubject);
    
    await User.updateOne(
      { email: email },
      { $set: { otp: code } }
    );
    return { status: "success", message: "6 digit OTP has been sent to your email" };
  } catch (err) {
    return { status: "failed", message: err.message };
  }
};


// ========== SignUp Functionalities ===========
exports.signUp = async (req, res)=> {
  try {
    // Create and save user to DB
    const userData = { ...req.body };
    const user = await User.create(userData);

    if (!user) {
      return res.status(400).send({message:"Couldn't create user"});
    }

    // Log user in and send jwt
    const token = await user.generateToken(user._id);
    res.cookie('tvUserToken', token, cookieOptions);

    // Send a welcome email to a new user
    let response = await userOTPService(user.email)

    res.status(201)
      .send({ message: '6 digit OTP has been sent to your email', user, token });
  }
  catch (err) {
    console.log(err)
    res.status(400).send({ error: err.message });
  }
}

// ========== Login Functionalities ===========
exports.loginUser = async (req, res) =>{
  const { email, password } = req.body;

  try {
    const user = await User.loginUser(email, password);

    if (!user) {
      return res.status(401).send({message:"No user found"});
    }
    const token = await user.generateToken();
    res.cookie('tvUserToken', token, cookieOptions);

    res.status(200).send({ message: 'Login successful', user, token });
  } catch (err) {
    res.status(401).send(err);
  }
}

// ========== Logout Functionalities ===========
module.exports.logoutUser = async (req, res) => {
  try {
    // Create fake token to cookie
    res.cookie('tvUserToken', 'nothing', {
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
  const baseURL = "https://www.tv.tasnimayan.dev"

  try {
    // handling request object
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'address', "active"];
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
      validUpdates.photo = baseURL + req.file.path.replace(/\\/g,'/').slice(6);
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

// ========== Account deletion Functionalities ===========
exports.getUserProfile = async (req, res) =>{

  const userId = new mongoose.Types.ObjectId(req.user._id)
  let matchStage = {$match: {_id:userId}}
  let joinWithTourStage = {$lookup:{from:'tours', localField:"userTours", foreignField:"_id", as:"tours"}}
  let unwindTourStage = {$unwind:"$userTours"}
  let projectionStage = {$project:{'_id':0, '__v':0, 'password':0, 'active':0, 'createdAt':0, 'updatedAt':0, 'tours._id':0, 'tours.__v':0, 'tours.createdAt':0, 'tours.updatedAt':0,}}

  try {
    const user =await User.aggregate([
      matchStage,
      joinWithTourStage,
      unwindTourStage,
      projectionStage
    ])

    if (!user) {
      return res.status(404).send({ message: 'No user found!' });
    }

    res.status(200).send({data:user});
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
}

// OTP verification complete
exports.VerifyOTP = async (req, res) =>{
  
  try{
    let email = req.user?.email
    let otp = req.params.otp
    
    if(!email){
      return res.status(401).send({ status: "fail", message: "Unauthorized access"});
    }

    let  user = await User.findOneAndUpdate({email:email , otp:otp}, {$set:{otp:"NaN", isVerified:true}})
    if(!user){
      return res.status(401).send({ status: "fail", message: "Unauthorized access"});
    }
    res.status(200).send({ status: "success", message: "Verification Successful!"});
  }
    catch (err) {
    return res.status(404).send({ status: "fail", message: err.message });
  }
}