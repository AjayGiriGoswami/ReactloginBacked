const express = require("express");
const router = new express.Router();
const userData = require("../Model/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Signup Api
router.post("/Signup", async (req, res) => {
  const { name, email, number, password } = req.body;
  // console.log(req.body);
  try {
    const preuser = await userData.findOne({ email: email });
    const hashpassword = await bcrypt.hash(password, 10);
    if (preuser) {
      // User is Already Existed
      res.json("Already have a acoount");
    } else {
      // Data in MongoDB
      const finalUser = new userData({
        name,
        email,
        number,
        password: hashpassword,
      });

      const storeData = await finalUser.save();
      res.status(201).json({ status: 201, storeData });
    }
  } catch (error) {
    res.status(422).json(error);
    console.log(error);
  }
});

// Login api
router.post("/Login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const preuser = await userData.findOne({ email: email });
    if (!preuser) {
      // user not found
      res.json("Existed");
    } else {
      const match = await bcrypt.compare(password, preuser.password);
      if (!match) {
        // wrong Password
        res.json("Wrong Password");
      } else {
        // token generate
        const token = jwt.sign({ email: preuser.email }, process.env.KEY, {
          expiresIn: "1d",
        });

        // cookie generate
        res.cookie("token", token, {
          expires: new Date(Date.now() + 9000000),
          httpOnly: true,
        });
        const result = {
          preuser,
          token,
        };
        // Login Succesfully
        res.status(201).json({ status: 201, result });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, error: "Internal Server Error" });
  }
});

// Forgot-password
router.post("/Forgot-Password", async (req, res) => {
  const { email } = req.body;
  // console.log(req.body);
  try {
    const oldUser = await userData.findOne({ email: email });
    if (!oldUser) {
      // User is Not Existed
      return res.json("Existed");
    }
    const token = jwt.sign({ id: oldUser._id }, process.env.KEY, {
      expiresIn: "5m",
    });
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_GOOGLE,
        pass: process.env.PASSWORD_GOOGLE,
      },
    });

    var mailOptions = {
      from: process.env.EMAIL_GOOGLE,
      to: email,
      subject: "Reset Your Passowrd",
      text: `"Link is Expires in 5 minute " http://localhost:3000/Rest-Password/${oldUser._id}/${token}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Error sending email" });
      } else {
        return res.status(201).json({ Status: 201 });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Rest-Password Api
router.post("/Rest-Password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  //   console.log(req.body);
  try {
    const decode = await jwt.verify(token, process.env.KEY);
    const id = decode.id;
    const hashpassword = await bcrypt.hash(password, 10);
    await userData.findByIdAndUpdate({ _id: id }, { password: hashpassword });
    res.status(201).json({ status: 201 });
  } catch (error) {
    res.json("Error");
  }
});

const Verifyuser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.json("no token");
    } else {
      const decode = await jwt.verify(token, process.env.KEY);
      next();
    }
  } catch (error) {
    res.json(error);
  }
};

// Verfited
router.get("/verify", Verifyuser, (req, res) => {
  // authoroized
  res.status(201).json({ Status: 201 });
});

// logout
router.get("/Logout", (req, res) => {
  res.clearCookie("token");
  res.status(201).json({ status: 201 });
});

module.exports = router;
