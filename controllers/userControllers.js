const userModel = require("../models/userModel");
const generateToken = require("../middleware/generateToken");

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ Error: "All Fields Required" });
  } else if (/[^a-zA-Z]/.test(name)) {
    return res.status(400).json({ Error: "Username must be in alphabet" });
  } else if (!/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/.test(email)) {
    return res.status(400).json({ Error: "Enter a valid email" });
  }
  const userExists = await userModel.findOne({ email });
  if (userExists) {
    res.status(400).json({ Error: "User Already Exists" });
  }

  const newUser = await userModel.create({
    name,
    email,
    password,
  });

  if (newUser) {
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    });
  } else {
    res.status(400).json({ Error: "Failed To Create New User" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ Error: "All Fields Required" });
  }
  const user = await userModel.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: await generateToken(user._id),
    });
  } else {
    res.status(400).json({ Error: "Wrong Credentials" });
  }
};

const updateUser = async (req, res) => {
  const body = req.body;
  if (!body) {
    return res.status(400).json({ Error: "Empty Fields cannot be updated" });
  }
  try {
    const updatedUser = await userModel.findOneAndUpdate(
      { _id: req.user._id },
      body,
      {
        new: true,
      }
    );
    if (updatedUser) {
      res.status(200).json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      });
    } else {
      res.status(400).json({ Error: "Failed to upload" });
    }
  } catch (error) {
    return res.status(400).json({ Error: error });
  }
};

module.exports = { registerUser, loginUser, updateUser };
