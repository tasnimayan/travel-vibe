const User = require("../../models/user");
const EmailSend = require("../../utils/mailSender");

const MAX_OTP_REQUESTS_PER_DAY = 5;

const OTP_TEMPLATES = {
  signup: {
    subject: "Sign Up Verification | Travel Vibe",
    template: (code) => `
      <h3>Welcome to Travel Vibe!</h3>
      <p>Please verify your email address to complete your registration.</p>
      <p>Your verification code (valid for 30 minutes):</p>
      <h2>${code}</h2>
    `
  },
  passwordReset: {
    subject: "Password Reset | Travel Vibe",
    template: (code) => `
      <h3>Password Reset Request</h3>
      <p>We received a request to reset your password.</p>
      <p>Your password reset code (valid for 30 minutes):</p>
      <h2>${code}</h2>
      <p>If you didn't request this, please ignore this email.</p>
    `
  }
};

exports.sendOtpEmail = async (email, type="signup") => {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if we need to reset the counter (new day)
    const now = new Date();
    if (user.otpRequestCountResetAt && now.getDate() !== user.otpRequestCountResetAt.getDate()) {
      user.otpRequestCount = 0;
      user.otpRequestCountResetAt = now;
    }

    // Check if user has exceeded daily limit
    if (user.otpRequestCount >= MAX_OTP_REQUESTS_PER_DAY) {
      throw new Error('Maximum OTP requests reached. Please try again 24 hours later.');
    }
    
    const code = Math.floor(100000 + Math.random() * 900000);
    const template = OTP_TEMPLATES[type];
    const emailText = template.template(code);
    
    // await EmailSend(email, emailText, template.subject);
    
    await User.updateOne(
      { email },
      {
        $set: { 
          otp: code,
          otpExpiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        },
        $inc: { otpRequestCount: 1 }
      }
    );
    
    return { status: "success", code };
  } catch (err) {
    return { status: "failed", message: err.message };
  }
};
