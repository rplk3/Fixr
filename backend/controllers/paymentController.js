const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod, cardHolderName, cardLastFour } = req.body;

    if (!bookingId || !amount || !cardHolderName || !cardLastFour) {
      return res.status(400).json({ message: "All payment fields are required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status !== "pending_payment") {
      return res.status(400).json({ message: "Booking must be pending payment before paying" });
    }

    const payment = await Payment.create({
      booking: bookingId,
      customer: req.user.id,
      amount,
      paymentMethod: paymentMethod || "card",
      cardHolderName,
      cardLastFour,
      status: "success",
    });

    // Mark booking as paid after payment
    booking.status = "paid";
    await booking.save();

    res.status(201).json({ message: "Payment successful", payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
