const User = require('../../models/user')
const Organization = require('../../models/organization')
const { sendOtpEmail } = require('../../services/auth/otpService')
const { cookieOptions } = require('../../utils')

// ========== SignUp Functionalities (v2)===========
exports.signUp = async (req, res) => {
  try {
    const { email, password, name, city, address, country } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status:"fail", message: 'Email is already registered.' });
    }

    // Create a new user
    const user = new User({
      email,
      password,
      role: 'organization',
      isVerified: false,
    });
    await user.save();

    // Create organization details
    const organization = new Organization({
      user: user._id,
      name,
      city,
      address,
      country,
    });
    await organization.save();

    if (!organization) {
      // Rollback user creation if profile creation fails
      await User.findByIdAndDelete(user._id);
      return res.status(400).send({status:"fail", message: "Couldn't create account"});
    }

    await sendOtpEmail(user.email, );

    res.status(201).send({ 
      status:"success",
      message: '6 digit OTP has been sent to your email',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: organization.name,
          role: user.role
        },
      }
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({status:"error", message: 'Internal server error.' });
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
      return res.status(401).send({status:"fail", message:"No user found"});
    }
    
    if(!user.isVerified){
      return res.status(400).json({
        status: 'fail',
        message: 'Please verify your email'
      }); 
    }

    // Generate JWT token and set cookie
    const token = await user.generateToken();
    res.cookie('org-tv-token', token, cookieOptions);

    res.status(200).send({status:"success", message: 'Login successful', data:{ user, token } });
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
    res.cookie('org-tv-token', 'expired', {
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

module.exports.profileDetails = async (req, res) => {
  const userId = req.user._id;

  try {
    // Find the organization linked to the user
    const organization = await Organization.findOne({ user: userId })
      .select('-__v -createdAt -updatedAt') // Exclude unnecessary fields
      .populate('user', 'email role');

    if (!organization) {
      return res.status(404).json({status: "fail", message: 'Organization not found.' });
    }

    res.status(200).json({
      status: "success",
      message: 'Profile details fetched successfully.',
      data: {
        organization
      }
    });
  } catch (error) {
    console.error('Error fetching profile details:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}


// ========== Update Profile API (v2)===========
module.exports.updateProfile = async (req, res) => {
  const { bio, website, contactEmail, contactPhone, postalCode } = req.body;
  const userId = req.user._id;

  try {
    const organization = await Organization.findOne({ user: userId });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    // Update the organization's profile
    organization.bio = bio || organization.bio;
    organization.website = website || organization.website;
    organization.contactEmail = contactEmail || organization.contactEmail;
    organization.contactPhone = contactPhone || organization.contactPhone;
    organization.postalCode = postalCode || organization.postalCode;

    if(req.file) {
			const imagePath = req.file?.path.replace(/\\/g,'/').slice(6);
      organization.profileImage = imagePath || organization.profileImage;

		}

    await organization.save();

    res.status(200).json({
      status: "success",
      message: 'Profile updated successfully.',
      data:{organization}
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}
