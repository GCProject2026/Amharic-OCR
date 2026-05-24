const router = require("express").Router();
const { register, login, profile } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, profile);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your Password Reset OTP",
      html: `
        <h2>Password Reset OTP</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      `,
    });

    res.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Failed to send OTP",
    });
  }
});
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetOtp: otp,
      resetOtpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      message: "Failed to reset password",
    });
  }
});
module.exports = router;