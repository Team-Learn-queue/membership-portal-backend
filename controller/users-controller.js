const { validationResult } = require("express-validator");
const User = require("../models/users");
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
      .json({ message: "Couldn't create User, Please Try Agai" });
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
      const mailOptions = {
        from: "RAOATECH <riliwanademola72@gmail.com>",
        to: email,
        subject: "We are thrilled to have you with us",
        html: `<html>
      <head>
        <title>Email Template</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <style>
          @import url("https://fonts.googleapis.com/css2?family=Bai+Jamjuree:wght@600;700&display=swap");
          @import url("https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap");
          table,
          td,
          div,
           h1 {
           font-family:  'Abril Fatface', cursive, !important;
          }
          p {
            font-family: "Bai jamjuree", sans-serif, !important;
          }
          table,
          /* td {
            border: 2px solid #000000 !important;
          } */
          /* Add your CSS styles here */
        </style>
      </head>
      <body style="margin: 0; padding: 0; ">
        <h1> RAOTECH IT-ELECTROMECH LIMITED </h1>
        <p> Hey ${user.name}</p>
        <p> We are thrilled to have you with us.  </p>
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
          return res
            .status(201)
            .json({ message: `${user.name} check you email for verification` });
        }
      });
    })
    .catch((e) => {
      return res
        .status(500)
        .json({ message: "Couldn't create User, Please Try Again", error: e });
    });
};

module.exports = {
  signup,
};
