const Service = require("../models/Service");

// @desc    Create a new service
// @route   POST /api/services
// @access  Private
const createService = async (req, res) => {
  try {
    const { title, description, category, price, location, availability, image } =
      req.body;

    if (!title || !description || !category || price === undefined || !location) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    const service = await Service.create({
      title,
      description,
      category,
      price,
      location,
      availability,
      image,
      provider: req.user._id,
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create service",
      error: error.message,
    });
  }
};

module.exports = {
  createService,
};