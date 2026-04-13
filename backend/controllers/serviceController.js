const Service = require("../models/Service");

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch services",
      error: error.message,
    });
  }
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Private
const createService = async (req, res) => {
  try {
    console.log("REQ USER:", req.user);
    console.log("REQ BODY:", req.body);
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
      provider: req.user.id || req.user._id,
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
  getServices,
  createService,
};