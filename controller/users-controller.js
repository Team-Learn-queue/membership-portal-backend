const { validationResult } = require("express-validator");
const User = require("../models/users");
const Token = require("../models/token");
const jwt = require("jsonwebtoken");

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "riliwanademola72@gmail.com",
    pass: process.env.EMAIL_PASS,
  },
});

const signup = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.errors[0].msg;
    return res.status(500).json({ message: message });
  }
  let first_name = req.body.name.split(" ")[0];
  const last_name = req.body.name.split(" ")[1];
  const {
    email,
    phone_number,
    password,
    company,
    license_status,
    regulator,
    sector,
    dob,
  } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return res.status(500).json({ message: " Signing Up Failed" });
  }

  if (existingUser) {
    return res.status(422).json({ message: "User Already Exist" });
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return res
      .status(422)
      .json({ message: "Couldn't create User, Please Try Again", e: err });
  }

  const user = User({
    first_name,
    last_name,
    email,
    phone_number,
    password: hashedPassword,
    company,
    license_status,
    regulator,
    sector,
    dob,
  });

  user
    .save()
    .then((user) => {
      // let userToken = jwt.sign(
      //   {
      //     userId: user.id,
      //     role: user.role,
      //   },
      //   "process.env.JWT_KEY",
      //   { expiresIn: "1h" }
      // );

      const token = Token({
        _userId: user._id,
        token: crypto.randomBytes(16).toString("hex"),
      });

      token.save().then((t) => {
        const emailLink = `http://${req.headers.host}/api/users/verify/${user.email}/${t.token}`;
        const mailOptions = {
          from: "FintechCEO <riliwanademola72@gmail.com>",
          to: email,
          subject: "We are thrilled to have you with us",
          html: `<html>
          <head>
            <title>Email Template</title>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="x-apple-disable-message-reformatting" />
            <style>
              @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;800&display=swap");
        
              body {
                font-family: "Poppins", sans-serif !important;
              }
            </style>
          </head>
          <body style="margin: 0; padding: 0">
            <img
              src="https://ceoforum.netlify.app/assets/img/logo.png"
              alt="fintech ceo's forum"
            />
            <p style="margin-top: 20px">Hello ${user.first_name} ${user.last_name},</p>
            <p style="margin-top: 20px">Thank you for joining Fintech Ceo's Forum, We are glad to have you.</p>
            <div style="margin-top: 70px">
              <a
                style="
                  margin: 0 auto;
                  background-color: #2d4f93;
                  font-size: 15px;
                  text-decoration: none;
                  padding: 15px 20px;
                  color: white;
                  display: inline-block;
                "
                href="${emailLink}"
                >Please verify your email</a
              >
            </div>
          </body>
        </html>
        
                `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res
              .status(500)
              .json({ message: "Error sending email", error });
          } else {
            return res.status(201).json({
              message: `${user.first_name} ${user.last_name} a verification email has been sent to ${user.email}`,
              // userObject: { userId: user.id, role: user.role },
              // token: userToken,
            });
          }
        });
      });
    })
    .catch((e) => {
      return res
        .status(500)
        .json({ message: "Couldn't create User, Please Try Again", error: e });
    });
};

//Login

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Login failed , please try again " });
  }

  if (!existingUser) {
    return res
      .status(403)
      .json({ message: "Invalid Credentials, could not log you in" });
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Invalid Credentials, could not log you in" });
  }

  if (!isValidPassword) {
    return res
      .status(403)
      .json({ message: "Invalid Credentials, could not log you in" });
  }
  if (!existingUser.isVerified) {
    return res
      .status(403)
      .json({ message: "Please Verify your email then Login" });
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        role: existingUser.role,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Logging Failed, Please try again" });
  }

  return res.status(201).json({
    message: `Login Sucessful`,
    userObject: { userId: existingUser.id, role: existingUser.role },
    token: token,
  });
};

// Verification of Email
const verifyEmail = async (req, res) => {
  let existingUser;
  let token;
  try {
    token = await Token.findOne({ token: req.params.token });
  } catch (err) {
    return res
      .status(500)
      .send("<h1>Verification Of Email Failed. Please Try again</h1>");
  }

  try {
    existingUser = await User.findOne({
      _id: token._userId.toString(),
      email: req.params.email,
    });
  } catch (err) {
    return res
      .status(500)
      .send("<h1>Verification Of Email Failed. Please Try again</h1>");
  }

  if (!existingUser) {
    return res.status(422).json({
      message:
        "We were unable to find a user for this verification. Please SignUp!",
    });
  } else if (existingUser.isVerified && token) {
    return res.status(201).send("<h1>User has already been verified. </h1>");
  } else {
    existingUser.isVerified = true;
    existingUser
      .save()
      .then((user) => {
        return res
          .status(200)
          .send(
            `<h1> ${user.first_name} ${user.last_name}, your email has been sucessfully verified </h1>`
          );
      })
      .catch((e) => {
        res.status(500).send("<h1>Verification Of Email Failed</h1>");
      });
  }
};

const forgotPassword = async (req, res) => {
  const email = req.body.email;
  let user;
  let token = crypto.randomBytes(16).toString("hex");

  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong, Please try again" });
  }
  if (!user) {
    return res.status(400).json({ message: "User does not exist" });
  }
  user.resetPasswordToken = "token";
  user.resetPasswordExpiry = Date.now() + 3600000;

  user
    .save()
    .then((user) => {
      const resetLink = `http://${req.headers.host}/api/users/reset-password/${user.email}/${token}`;

      const mailOptions = {
        from: "FintechCEO <riliwanademola72@gmail.com>",
        to: email,
        subject: "Password Reset",
        html: `<html>
      <head>
        <title>Email Template</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
       
      </head>
      <body style="margin: 0; padding: 0">
        <img
          src="https://ceoforum.netlify.app/assets/img/logo.png"
          alt="fintech ceo's forum"
        />
        <p style="margin-top: 20px">You requested a Password Reset</p>
        <p style="margin-top: 20px">Please click on the link and follow the process.</p>
        <div style="margin-top: 70px">
          <a
            style="
              margin: 0 auto;
              background-color: #2d4f93;
              font-size: 15px;
              text-decoration: none;
              padding: 15px 20px;
              color: white;
              display: inline-block;
            "
            href="${resetLink}"
            >Reset Password</a
          >
        </div>
      </body>
    </html>
    
            `,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "Error sending email", error });
        } else {
          return res.status(201).json({
            message: `A password reset email has been sent to ${user.email}`,
            // userObject: { userId: user.id, role: user.role },
            // token: userToken,
          });
        }
      });
    })

    .catch((e) => {
      return res.status(500).json({ message: "Couldn't save User ", error: e });
    });
};

const resetPassword = async (req, res) => {
  let user;
  const email = req.params.email;
  const token = req.params.token;
  const newPassword = req.body.password;

  try {
    user = await User.findOne({
      email: email,
      resetPasswordToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong, Please try again" });
  }
  if (!user) {
    return res
      .status(400)
      .json({ message: "User's token to reset password invalid or expired" });
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(newPassword, 12);
  } catch (err) {
    return res
      .status(422)
      .json({ message: "Couldn't create User, Please Try Again", e: err });
  }

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  user
    .save()
    .then((user) => {
      return res.status(200).json({
        message: `${user.first_name} ${user.last_name} your password has been resetted sucessfully`,
      });
    })
    .catch((e) => {
      return res
        .status(500)
        .json({ message: "Couldn't Reset password", error: e });
    });
};

const editProfile = async (req, res) => {
  const errors = validationResult(req);
  const userId = req.params.id.replace(/\s+/g, ' ').trim();

  if (!errors.isEmpty()) {
    const message = errors.errors[0].msg;
    return res.status(500).json({ message: message });
  }

  const { first_name, last_name, email, phone_number, organization, dob } =
    req.body;
  let editedUser;
  try {
    editedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { first_name, last_name, email, phone_number, company: organization, dob } },
      { new: true }
    );
  } catch (err) {
    return res
      .status(500)
      .json({ message: " Something went Please try again" });
  }

  if (!editedUser) {
    return res.status(400).json({ message: "User does not exist" });
  }

  return res.status(201).json({ message: " Your profile has been sucessfully edited"});



};

module.exports = {
  signup,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  editProfile,
};
