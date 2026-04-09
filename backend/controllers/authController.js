const User = require("../models/User");
const bcrypt = require("bcryptjs");

//Register User
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

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

    } catch (error) {
        res.status(500).json({error: error.message});
    }
};