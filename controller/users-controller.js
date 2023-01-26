const { validationResult } = require("express-validator");
const User = require("../models/users");
const Token = require("../models/token");

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const token = require("../models/token");

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

  const { email, name, phone_number, password } = req.body;
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
      .json({ message: "Couldn't create User, Please Try Again", e:err });
  }



  const user = User({
    name,
    email,
    phone_number: phone_number,
    password: hashedPassword,
  });

  user
    .save()
    .then((user) => {
      const t = Token({
        _userId: user._id,
        token: crypto.randomBytes(16).toString("hex"),
      });

      t.save().then((token) => {
        const emailLink = `http://${req.headers.host}/api/users/verify/${user.email}/${token.token}`;
        const mailOptions = {
          from: "Fintech Ceo's Forum<riliwanademola72@gmail.com>",
          to: email,
          subject: "We are thrilled to have you with us",
          html: `<html>
                  <head>

                    <title>Email Template</title>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <meta name="x-apple-disable-message-reformatting" />
                    <style>
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;800&display=swap');

                      
                      
                      body {
                        font-family: "Poppins", sans-serif, !important;
                      }
                      
                    </style>
                  </head>
                  <body style="margin: 0; padding: 0; ">

                    <img src="https://ceoforum.netlify.app/assets/img/logo.png" alt="fintech ceo's forum"/>
                    <p > Hello ${user.name},</p>
                    <p> Thank you for joining Fintech Ceo's Forum, We are glad to have you. </p>
                    <div style="justify-content: center; display: flex;margin-top: 70px;">
      <a
      style=" margin: 0 auto; background-color: #2d4f93; font-size: 15px; text-decoration: none; padding: 15px 20px; color: white; display: inline-block;"
      href="${emailLink}"
      >Please verify your email</a
    >
    </div>                 </body>
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
              message: `${user.name} a verification email has been sent to ${user.email}`,
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
            `<h1> ${user.name}, your email has been sucessfully verified </h1>`
          );
      })
      .catch((e) => {
        res.status(500).send("<h1>Verification Of Email Failed</h1>");
      });
  }
};

module.exports = {
  signup,
  verifyEmail,
};
