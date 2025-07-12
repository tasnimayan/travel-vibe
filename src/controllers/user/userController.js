const User = require("../../models/user");
const mongoose = require("mongoose");
const UserProfile = require("../../models/userProfile");
const { sendOtpEmail } = require("../../services/auth/otpService");
const { cookieOptions } = require("../../utils");

/*
1. User can create account         -Done
2. User can Login to account      -Done
3. User can update profile information  -Done
4. User can reset password         -Done
5. User can recover their account  -Done
6. User can delete their account   -Done
*/

// In the signUp function  => Add the email sending function when domain is purchased

// ========== SignUp Functionalities (v2)===========
exports.signUp = async (req, res) => {
  try {
    const { email, password, name, country, city, address } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    const userData = {
      email,
      password,
      role: "user", // Default role for travelers
    };

    const user = await User.create(userData);

    if (!user) {
      return res.status(400).send({ status: "fail", message: "Couldn't create user account" });
    }

    const profileData = {
      user: user._id,
      name,
      country: country || "",
      city: city || "",
      address: address || "",
      isActive: true,
      isVerified: false,
    };

    const userProfile = await UserProfile.create(profileData);

    if (!userProfile) {
      // Rollback user creation if profile creation fails
      await User.findByIdAndDelete(user._id);
      return res.status(400).send({ status: "fail", message: "Couldn't create user profile" });
    }

    // Send OTP verification email
    await sendOtpEmail(user.email);

    res.status(201).send({
      status: "success",
      message: "6 digit OTP has been sent to your email",
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: userProfile.name,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({ status: "fail", message: err.message });
  }
};

// ========== Login Functionalities (v2)===========
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    const user = await User.login(email, password);

    if (!user) {
      return res.status(401).send({ status: "fail", message: "No user found" });
    }

    if (!user.isVerified || !user.role !== "user") {
      return res.status(400).json({
        status: "fail",
        message: "Please verify your email",
      });
    }

    // Generate JWT token and set cookie
    const token = await user.generateToken();

    res.status(200).send({ status: "success", message: "Login successful", data: { user, token } });
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: err.message || "Authentication failed",
    });
  }
};

// ========== Logout Functionalities (v2)===========
module.exports.logoutUser = async (req, res) => {
  try {
    // Create fake token to cookie
    res.cookie("tv-token", "expired", {
      expires: new Date(Date.now() + 10_000),
      httpOnly: true, // Prevents access on client side
    });

    // api and db logout
    req.token = undefined;
    req.user.token = undefined;

    res.status(200).send({ status: "success", message: "Logout successful!" });
  } catch (err) {
    res.status(400).send({ status: "fail", message: err.message });
  }
};

// User profile functionalities
module.exports.getUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).send({ message: "No user found!" });
    }

    res.status(200).send({ status: "success", message: "User found", data: user });
  } catch (err) {
    res.status(400).send({ status: "fail", message: "Something went wrong", error: err.message });
  }
};

// ========== User Data Update Functionalities ===========
exports.updateUser = async (req, res) => {
  const baseURL = "https://www.tv.tasnimayan.dev";

  try {
    // handling request object
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "address", "active"];
    let validUpdates = {};

    // filtering updates
    updates.forEach((el) => {
      if (allowedUpdates.includes(el)) {
        validUpdates[el] = req.body[el];
      }
      return validUpdates;
    });

    // saving photos
    if (req.file) {
      validUpdates.photo = baseURL + req.file.path.replace(/\\/g, "/").slice(6);
    }

    const user = await User.findByIdAndUpdate(req.user._id, validUpdates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).send();
    }

    res.status(200).send({ message: "user updated!", user });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

// ========== Account deletion Functionalities ===========
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);

    if (!user) {
      return res.status(404).send({ message: "No user found!" });
    }

    res.status(204).send("successful");
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

// ========== Account deletion Functionalities ===========
exports.getUserProfile = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  let matchStage = { $match: { _id: userId } };
  let joinWithTourStage = { $lookup: { from: "tours", localField: "userTours", foreignField: "_id", as: "tours" } };
  let unwindTourStage = { $unwind: "$userTours" };
  let projectionStage = {
    $project: {
      _id: 0,
      __v: 0,
      password: 0,
      active: 0,
      createdAt: 0,
      updatedAt: 0,
      "tours._id": 0,
      "tours.__v": 0,
      "tours.createdAt": 0,
      "tours.updatedAt": 0,
    },
  };

  try {
    const user = await User.aggregate([matchStage, joinWithTourStage, unwindTourStage, projectionStage]);

    if (!user) {
      return res.status(404).send({ message: "No user found!" });
    }

    res.status(200).send({ data: user });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};
