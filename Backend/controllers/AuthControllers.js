const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/Users.js");

// Generate the token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc Register a new user
// @route POST api/auth/register
// @access Public
const registerUser = async (req, res) => {
  try {
    console.log("Register request received:", req.body);
    const { name, email, password, profileImageUrl, adminInviteToken } =
      req.body;
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    // Check if user is already exist
    const userExist = await User.findOne({ email: normalizedEmail });

    if (userExist) {
      return res.status(400).json({ message: "User is already exist" });
    }

    // determine user role : admin if correct token is provided, otherwise Member
    let role = "member";
    if (
      adminInviteToken &&
      adminInviteToken == process.env.ADMIN_INVITE_TOKEN
    ) {
      role = "admin";
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create new User
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashPassword,
      profileImageUrl,
      role,
    });

    console.log("User created:", user);

    // return user data with jwt
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Register error:", err);
    res
      .status(500)
      .json({ message: "Internal server issue", err: err.message });
  }
};

// @desc login user
// @route POST api/auth/login
// @access Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // return user data with jwt
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server issue", err: err.message });
  }
};

// @desc get user profile
// @route GET api/auth/profile
// @access Private(requrie JWT)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    console.log("FETCHED USER FROM DB:", user);
    if (!user) {
      return res.status(404).json({ message: "user is not found" });
    }
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server issue", err: err.message });
  }
};

// @desc update user profile
// @route PUT api/auth/profile
// @access Private(requrie JWT)
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User is not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updateUser = await user.save();
    res.json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      role: updateUser.role,
      token: generateToken(updateUser._id),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server issue", err: err.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
