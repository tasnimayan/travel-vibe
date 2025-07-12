const User = require('../../models/user')
const { sendOtpEmail } = require('../../services/auth/otpService')
const { cookieOptions } = require('../../utils')


// ========== SignUp Functionalities (v2)===========
exports.signUp = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).send({
        status: 'fail',
        message: 'Must provide email and password'
      });
    }
    
    const adminData = {
      email,
      password,
      displayName: name,
      role: 'admin',
    };
    
    const admin = await User.create(adminData);

    if (!admin) {
      return res.status(400).send({status:"fail", message: "Couldn't create admin account"});
    }

    // Send OTP verification email
    await sendOtpEmail(admin.email, );

    res.status(201).send({ 
      status:"success",
      message: '6 digit OTP has been sent to your email',
    });
  }
  catch (err) {
    res.status(400).send({ status:"fail", message: err });
  }
}

// ========== Login Functionalities (v2)===========
exports.loginUser = async (req, res) =>{
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    const user = await User.login(email, password);

    if (!user) {
      return res.status(401).send({message:"No user found"});
    }

    // Generate JWT token and set cookie
    const token = await user.generateToken();
    res.cookie('_admin-tv-token', token, cookieOptions);

    res.status(200).send({status:"success", message: 'Login successful', data:{ user:user.toJSON(), token } });
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err.message || 'Authentication failed'
    });
  }
}

// ========== Logout Functionalities (v2)===========
module.exports.logoutUser = async (req, res) => {
  try {
    // Create fake token to cookie
    res.cookie('_admin-tv-token', 'expired', {
      expires: new Date(Date.now() + 10_000),
      httpOnly: true, // Prevents access on client side
    });

    // api and db logout
    req.token = undefined;
    req.user.token = undefined;

    res.status(200).send({ status:"success", message: 'Logout successful!' });
  } catch (err) {
    res.status(400).send({ status:"fail", message: err.message });
  }
}