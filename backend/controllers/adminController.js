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

// ──────────────────────────────────────────────
// BOOKINGS / APPOINTMENTS
// ──────────────────────────────────────────────
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await safeFind(Booking, {}, null, { createdAt: -1 });
    res.status(200).json(bookings);
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
    const payments = await safeFind(Payment, {}, null, { createdAt: -1 });
    res.status(200).json(payments);
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
