const User = require("../models/User");
const Provider = require("../models/Provider");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User (always as customer)
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body || {};

    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({ message: "First name, last name, email, phone and password are required" });
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Password min length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      roles: ['customer'],
      providerStatus: 'none',
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been suspended. Please contact support." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        profileImage: user.profileImage || '',
        roles: user.roles,
        providerStatus: user.providerStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply to become a service provider
exports.applyProvider = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.providerStatus !== 'none' && user.providerStatus !== 'rejected') {
      return res.status(400).json({ message: "You have already applied to be a provider" });
    }

    const { title, description, category, price, location, availability, image } = req.body;

    if (!title || !description || !category || price === undefined || !location) {
        return res.status(400).json({ message: "Missing required provider fields" });
    }

    const newProvider = await Provider.create({
        user: user._id,
        title,
        description,
        category,
        price: Number(price),
        location,
        availability: availability !== undefined ? availability : true,
        image: image || ""
    });

    user.providerStatus = 'pending';
    await user.save();

    res.status(200).json({
      message: "Provider application submitted successfully",
      providerStatus: user.providerStatus,
      provider: newProvider
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { firstName, lastName, phone, profileImage } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        roles: user.roles,
        providerStatus: user.providerStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};