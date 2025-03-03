const User = require("../../models/user");
const { sendOtpEmail } = require("../../services/auth/otpService");

// OTP verification complete (v2)
exports.verifyOTP = async (req, res) =>{
  try {
    const { email, otp } = req.body
    
    if( !email ){
      return res.status(401).send({ status: "fail", message: "Unauthorized access"});
    }

    const user = await User.findOneAndUpdate(
      { email: email , otp: Number(otp), otpExpiresAt: { $gt: new Date() }},
      { $set: { otp: null, isVerified: true}
    }).select("email otp otpExpiresAt")

    if(!user){
      return res.status(401).send({ status: "fail", message: "The provided email and OTP do not match"});
    }
    res.status(200).send({ status: "success", message: "Verification Successful!"});
  }
    catch (err) {
    return res.status(404).send({ status: "fail", message: err.message });
  }
}

// Resend OTP verification code (v2)
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ status: 'fail', message: 'Please provide email address' });
    }
    await sendOtpEmail(email)

    res.status(200).send({ status: 'success', message: '6 digit OTP has been resent to your email' });
  } catch (err) {
    res.status(400).send({ status: 'fail', message: err.message });
  }
}