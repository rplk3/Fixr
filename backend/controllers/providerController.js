const User = require("../models/User");
const Provider = require("../models/Provider");

// Apply to become a service provider
exports.applyProvider = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.providerStatus !== 'none' && user.providerStatus !== 'rejected') {
      return res.status(400).json({ message: "You have already applied to be a provider" });
    }

    const { title, description, category, price, location, availability, image } = req.body;

    if (!title || !description || !category || price === undefined || !location) {
        return res.status(400).json({ message: "Missing required provider fields" });
    }

    const newProvider = await Provider.create({
        user: user._id,
        title,
        description,
        category,
        price: Number(price),
        location,
        availability: availability !== undefined ? availability : true,
        image: image || ""
    });

    user.providerStatus = 'pending';
    await user.save();

    res.status(200).json({
      message: "Provider application submitted successfully",
      providerStatus: user.providerStatus,
      provider: newProvider
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProviders = async (req, res) => {
  try {
    const providers = await Provider.find({}).populate({ path: "user", select: "firstName lastName email providerStatus" }).sort({ createdAt: -1 }).lean();
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