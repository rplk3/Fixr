const Complaint = require("../models/Complaint");

// ──────────────────────────────────────────────
// CUSTOMER ROUTES
// ──────────────────────────────────────────────

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private
exports.createComplaint = async (req, res) => {
  try {
    const { title, category, description, priority, contactEmail } = req.body;
    
    // Server-side validation
    if (!title || !category || !description || !priority || !contactEmail) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const userId = req.user.id || req.user._id;

    const complaint = await Complaint.create({
      user: userId,
      title,
      category,
      description,
      priority,
      contactEmail,
      status: "pending"
    });

    res.status(201).json({ message: "Complaint submitted successfully", complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's complaints
// @route   GET /api/complaints/my
// @access  Private
exports.getMyComplaints = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const complaints = await Complaint.find({ user: userId }).sort({ createdAt: -1 }).lean();
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// ADMIN ROUTES
// ──────────────────────────────────────────────

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private/Admin
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private/Admin
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .lean();
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private/Admin
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = status;
    await complaint.save();

    res.status(200).json({ message: `Complaint marked as ${status}`, complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private/Admin
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (complaint.status !== "resolved") {
      return res.status(400).json({ message: "Only resolved complaints can be deleted" });
    }

    await complaint.deleteOne();
    res.status(200).json({ message: "Complaint deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
