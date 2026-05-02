const Booking = require("../models/Booking");

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
