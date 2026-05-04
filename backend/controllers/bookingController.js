const Booking = require("../models/Booking");
const Review = require("../models/Review");
const Service = require("../models/Service");

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const { serviceId, providerId, date, time, location, notes, phone } = req.body;

    if (!serviceId || !providerId || !date || !time || !location) {
      return res.status(400).json({ message: "Service, provider, date, time and location are required" });
    }

    const booking = await Booking.create({
      service: serviceId,
      customer: req.user.id,
      provider: providerId,
      date,
      time,
      location,
      notes: notes || "",
      phone: phone || "",
    });

    res.status(201).json({ message: "Booking requested successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bookings for current user (as customer)
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate("service", "title price category image")
      .populate("provider", "firstName lastName")
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bookings for current user (as provider)
exports.getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user.id })
      .populate("service", "title price category")
      .populate("customer", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update booking status (provider accepts/rejects)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending_payment", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only the provider of this booking can update
    if (booking.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ message: `Booking ${status}`, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get provider earnings summary
exports.getProviderEarnings = async (req, res) => {
  try {
    const providerId = req.user.id;

    // All completed/paid bookings for this provider
    const bookings = await Booking.find({
      provider: providerId,
      status: { $in: ["completed", "paid"] },
    })
      .populate("service", "title price category")
      .sort({ createdAt: -1 })
      .lean();

    // Total earnings
    const totalEarnings = bookings.reduce((sum, b) => sum + (b.service?.price || 0), 0);
    const totalJobs = bookings.length;

    // Monthly breakdown (last 6 months)
    const monthly = {};
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthly[key] = { month: key, earnings: 0, jobs: 0 };
    }
    bookings.forEach((b) => {
      const d = new Date(b.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthly[key]) {
        monthly[key].earnings += b.service?.price || 0;
        monthly[key].jobs += 1;
      }
    });

    // Per-service breakdown
    const perService = {};
    bookings.forEach((b) => {
      const sid = b.service?._id?.toString() || "unknown";
      if (!perService[sid]) {
        perService[sid] = {
          serviceId: sid,
          title: b.service?.title || "Unknown",
          category: b.service?.category || "",
          earnings: 0,
          jobs: 0,
        };
      }
      perService[sid].earnings += b.service?.price || 0;
      perService[sid].jobs += 1;
    });

    res.status(200).json({
      totalEarnings,
      totalJobs,
      monthly: Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month)),
      perService: Object.values(perService).sort((a, b) => b.earnings - a.earnings),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reviews for the provider's services
exports.getProviderReviews = async (req, res) => {
  try {
    const providerId = req.user.id;

    // Find all services owned by this provider
    const services = await Service.find({ provider: providerId }).select("_id title").lean();
    const serviceIds = services.map((s) => s._id);

    if (serviceIds.length === 0) {
      return res.status(200).json({ reviews: [], averageRating: 0, totalReviews: 0 });
    }

    // Find all reviews for those services
    const reviews = await Review.find({ service: { $in: serviceIds } })
      .populate("customer", "firstName lastName profileImage")
      .populate("service", "title category")
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 0;

    res.status(200).json({ reviews, averageRating: Number(averageRating), totalReviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
