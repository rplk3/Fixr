const User = require("../models/User");
const bcrypt = require("bcryptjs");

//Register User
exports.registerUser = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: "Request body is required" });
        }

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "name, email and password are required" });
        }

        //check if user exists
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({message: "User already exists"});
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //create user 

        const user = new User({
            name,
            email,
            password: hashedPassword,
        });

        const savedUser = await user.save();
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
            },
        });

    } catch (error) {
        res.status(500).json({error: error.message});
    }
};