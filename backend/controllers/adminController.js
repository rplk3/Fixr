const User = require("../models/User");
const Service = require("../models/Service");
const Provider = require("../models/Provider");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const Payment = require("../models/Payment");

// Helper: safe count that returns 0 if model is empty/not defined
const safeCount = async (Model, filter = {}) => {
  try {
    if (!Model || !Model.countDocuments) return 0;
    return await Model.countDocuments(filter);
  } catch {
    return 0;
  }
};

const safeFind = async (Model, filter = {}, populate = null, sort = {}) => {
  try {
    if (!Model || !Model.find) return [];
    let query = Model.find(filter);
    if (populate) query = query.populate(populate);
    if (sort) query = query.sort(sort);
    return await query.lean();
  } catch {
    return [];
  }
};

// ──────────────────────────────────────────────
// GET /api/admin/dashboard — Stats overview
// ──────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalProviders, pendingProviders, totalServices, totalBookings, totalReviews, totalComplaints] =
      await Promise.all([
        safeCount(User),
        safeCount(User, { roles: "provider" }),
        safeCount(User, { providerStatus: "pending" }),
        safeCount(Service),
        safeCount(Booking),
        safeCount(Review),
        // Complaints = reviews with rating <= 2 (or 0 if no Review model)
        safeCount(Review, { rating: { $lte: 2 } }),
      ]);

    res.status(200).json({
      totalUsers,
      totalProviders,
      pendingProviders,
      totalServices,
      totalBookings,
      totalReviews,
      totalComplaints,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// SERVICES / CATEGORY MANAGEMENT
// ──────────────────────────────────────────────
exports.getAllServices = async (req, res) => {
  try {
    const services = await safeFind(Service, {}, { path: "provider", select: "firstName lastName email" }, { createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.status(200).json({ message: "Service deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// BOOKINGS / APPOINTMENTS
// ──────────────────────────────────────────────
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customer", "firstName lastName email")
      .populate("provider", "firstName lastName email")
      .populate("service", "title category price")
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer", "firstName lastName email phone")
      .populate("provider", "firstName lastName email phone")
      .populate("service", "title category price")
      .lean();
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// PROVIDERS / WORKER PROFILES
// ──────────────────────────────────────────────
exports.getAllProviders = async (req, res) => {
  try {
    const providers = await safeFind(Provider, {}, { path: "user", select: "firstName lastName email providerStatus" }, { createdAt: -1 });
    res.status(200).json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProviderStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'approved' or 'rejected'" });
    }

    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    const user = await User.findById(provider.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.providerStatus = status;
    if (status === "approved" && !user.roles.includes("provider")) {
      user.roles.push("provider");
    }
    if (status === "rejected") {
      user.roles = user.roles.filter((r) => r !== "provider");
    }
    await user.save();

    res.status(200).json({ message: `Provider ${status}`, providerStatus: status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    const user = await User.findById(provider.user);
    if (user) {
      user.roles = user.roles.filter((r) => r !== "provider");
      user.providerStatus = "none";
      await user.save();
    }

    await provider.deleteOne();
    res.status(200).json({ message: "Provider deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// PAYMENTS / FINANCIAL RECORDS
// ──────────────────────────────────────────────
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({ path: "customer", select: "firstName lastName email" })
      .populate({
        path: "booking",
        populate: [
          { path: "service", select: "title category" },
          { path: "provider", select: "firstName lastName email" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({ path: "customer", select: "firstName lastName email" })
      .populate({
        path: "booking",
        populate: [
          { path: "service", select: "title category price" },
          { path: "provider", select: "firstName lastName email" },
        ],
      })
      .lean();
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ["paid", "success", "failed", "refunded", "cancelled", "pending"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Use one of: ${validStatuses.join(", ")}` });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.status = status === "success" ? "paid" : status;
    if (notes !== undefined) payment.notes = notes;
    if (status === "paid" || status === "success") payment.paidAt = new Date();
    await payment.save();

    // Also update booking payment-related status
    if (payment.booking) {
      const Booking = require("../models/Booking");
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        if (status === "paid" || status === "success") {
          booking.status = "paid";
          booking.paymentStatus = "paid";
        } else if (status === "failed") {
          booking.paymentStatus = "failed";
        } else if (status === "refunded") {
          booking.paymentStatus = "refunded";
        } else if (status === "pending") {
          booking.paymentStatus = "pending";
        }
        await booking.save();
      }
    }

    res.status(200).json({ message: `Payment marked as ${status}`, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json({ message: "Payment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// REVIEWS / FEEDBACK & SUPPORT
// ──────────────────────────────────────────────
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await safeFind(Review, {}, null, { createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    if (!Review || !Review.findByIdAndDelete) {
      return res.status(200).json({ message: "No reviews module yet" });
    }
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// USERS MANAGEMENT
// ──────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, roles, providerStatus, isActive } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "First name, last name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User with this email already exists" });

    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone: phone || "",
      password: hashedPassword,
      roles: roles || ["customer"],
      providerStatus: providerStatus || "none",
      isActive: isActive !== undefined ? isActive : true,
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ message: "User created successfully", user: userObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, roles, providerStatus, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "Email already in use by another account" });
      user.email = email;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (roles) user.roles = roles;
    if (providerStatus) user.providerStatus = providerStatus;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ message: "User updated successfully", user: userObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
