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
      .populate("service", "title price category")
      .populate("provider", "firstName lastName")
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
