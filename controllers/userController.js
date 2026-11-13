const User = require("../models/User");

const createUser = async (req, res) => {
  try {
    const { username, password, role, email, ...rest } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({
      username: username.trim(),
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists. Please choose a different username.",
      });
    }

    const userData = {
      ...rest,
      username: username.trim(),
      password,
      role,
    };

    // Only set email if provided (sparse index skips undefined, avoiding duplicate key error on empty string)
    if (email && email.trim() !== "") {
      const existingEmail = await User.findOne({
        email: email.trim().toLowerCase(),
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email address is already registered.",
        });
      }
      userData.email = email.trim().toLowerCase();
    }

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      user,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "Field";
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { password, email, ...rest } = req.body;
    const updateOps = { $set: rest };

    if (password) {
      updateOps.$set.password = password;
    }

    if (email && email.trim() !== "") {
      updateOps.$set.email = email.trim().toLowerCase();
    } else if (email === "" || email === null) {
      updateOps.$unset = { email: 1 };
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateOps, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User Updated Successfully",
      user,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "Field";
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
};