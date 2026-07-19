const jwt = require("jsonwebtoken");
const User = require("../models/User");

const loginSuperAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Super Admin Login
    if (
      username === process.env.SUPER_ADMIN_USERNAME &&
      password === process.env.SUPER_ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        {
          username,
          role: "SUPER_ADMIN",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "8h",
        }
      );

      return res.status(200).json({
        success: true,
        token,
        role: "SUPER_ADMIN",
      });
    }

    // Normal User Login
    const user = await User.findOne({
      username,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    return res.status(200).json({
      success: true,
      token,
      role: user.role,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  loginSuperAdmin,
};