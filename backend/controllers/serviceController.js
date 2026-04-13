const Service = require("../models/Service");
const { updateMany } = require("../models/User");

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

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Private
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch service",
      error: error.message,
    });
  }
};

module.exports = {
  getServices,
  createService,
  getServiceById,
  updateService,
};