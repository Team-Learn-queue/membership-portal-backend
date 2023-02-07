const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const Fs = require("fs");

const { isValidObjectId } = require("mongoose");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const crypto = require("crypto");
const path = require("path");

const User = require("../models/users");
const VerificationToken = require("../models/verificationToken");
const ResetToken = require("../models/resetToken");
const FileUpload = require("../models/resourceLibrary");
dotenv.config();

const connection = mongoose.createConnection(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zchdj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
); // `gridfs` is the database, you can name it as you want

const {
  transporter,
  verifyEmailTemplate,
  forgotEmailTemplate,
  passwordSetTemplate,
  verifiedTemplate,
} = require("../util/email");

let bucket;
connection.once("open", () => {
  bucket = new mongoose.mongo.GridFSBucket(connection, {
    bucketName: "resources", // Override the default bucket name (fs)
    chunkSizeBytes: 1048576, // Override the default chunk size (255KB)
  });
});
// Register New USER
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
  // let hashedPassword;
  // try {
  //   hashedPassword = await bcrypt.hash(password, 12);
  // } catch (err) {
  //   return res
  //     .status(422)
  //     .json({ message: "Couldn't create User, Please Try Again", e: err });
  // }

  const user = User({
    first_name,
    last_name,
    email,
    phone_number,
    password,
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
      const randomBytes = crypto.randomBytes(16).toString("hex");

      const token = VerificationToken({
        userId: user._id,
        token: randomBytes,
      });

      token.save().then(() => {
        const emailLink = `http://${req.headers.host}/api/users/verify/${user.email}/${randomBytes}`;
        const mailOptions = verifyEmailTemplate(user, emailLink);

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res
              .status(500)
              .json({ message: "Error sending email", error });
          } else {
            return res.status(201).json({
              message: `${user.first_name} ${user.last_name} a confirmation email has been sent to ${user.email}`,
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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.errors[0].msg;
    return res.status(500).json({ message: message });
  }
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
    isValidPassword = await existingUser.comparePassword(password);
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
  // const {email,token}  = req.params
  // if (!email && !token) return res.status(403).json({message: "Invalid Request"});
  // if(!isValidObjectId(uid)) return res.status(404).json({ message: "Invalid User" });

  let existingUser;
  let token;
  try {
    token = await VerificationToken.findOne({ token: req.params.token });
  } catch (err) {
    return res
      .status(500)
      .send("<h1>Verification Of Email Failed. Please Try again</h1>");
  }

  if (!token)
    return res
      .status(401)
      .send(
        "<h1>Your verification link may have expired. Please click on resend for verify your Email </h1>"
      );

  try {
    existingUser = await User.findOne({
      _id: token.userId.toString(),
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
  } else if (existingUser.isVerified) {
    await VerificationToken.findByIdAndDelete(token._id);

    return res.status(201).send("<h1>User has already been verified. </h1>");
  } else {
    existingUser.isVerified = true;
    await VerificationToken.findByIdAndDelete(token._id);
    existingUser
      .save()
      .then((user) => {
        const mailOptions = verifiedTemplate(user);
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
        return res
          .status(200)
          .send(
            `<h1> ${user.first_name} ${user.last_name}, your email has been sucessfully verified, Please go and Login </h1>`
          );
      })
      .catch((e) => {
        res.status(500).send("<h1>Verification Of Email Failed</h1>");
      });
  }
};

const resendLink = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.errors[0].msg;
    return res.status(500).json({ message: message });
  }
  let user;
  try {
    user = await User.findOne({ email: req.body.email });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong, Please try again" });
  }

  if (!user) return res.status(401).json({ message: "User not found" });
  if (user.isVerified)
    return res.status(200).json({
      message: "This Account has already been verified, Please Log in",
    });

  const randomBytes = crypto.randomBytes(16).toString("hex");

  const token = VerificationToken({
    userId: user._id,
    token: randomBytes,
  });

  token
    .save()
    .then(() => {
      const emailLink = `http://${req.headers.host}/api/users/verify/${user.email}/${randomBytes}`;
      const mailOptions = verifyEmailTemplate(user, emailLink);

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "Error sending email", error });
        } else {
          return res.status(201).json({
            message: `${user.first_name} ${user.last_name} a verification email has been sent to ${user.email}`,
          });
        }
      });
    })
    .catch((e) => {
      return res
        .status(500)
        .json({ message: "Couldn't create User, Please Try Again", error: e });
    });
};

const forgotPassword = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.errors[0].msg;
    return res.status(500).json({ message: message });
  }
  const email = req.body.email;
  let user;
  let token = crypto.randomBytes(16).toString("hex");

  try {
    user = await User.findOne({ email });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong, Please try again" });
  }
  if (!user) {
    return res.status(400).json({ message: "User does not exist" });
  }

  const oldToken = await ResetToken.findOne({ userId: user.id });
  if (oldToken) await oldToken.deleteOne();

  const resetToken = ResetToken({ userId: user.id, token: token });

  resetToken
    .save()
    .then(() => {
      const resetLink = `http://localhost:3000/reset-password?userId=${user.id}&token=${token}`;
      const mailOptions = forgotEmailTemplate(user, resetLink);

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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.errors[0].msg;
    return res.status(500).json({ message: message });
  }
  let user;

  const newPassword = req.body.password;

  try {
    user = await User.findOne(req.user._id);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong, Please try again" });
  }
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // let hashedPassword;
  // try {
  //   hashedPassword = await bcrypt.hash(newPassword, 12);
  // } catch (err) {
  //   return res
  //     .status(422)
  //     .json({ message: "Couldn't create User, Please Try Again", e: err });
  // }

  // user.password = hashedPassword;

  const samePass = await user.comparePassword(newPassword);
  if (samePass)
    return res.status(402).json({
      message: `New Password must be different`,
    });

  user.password = newPassword.trim();

  user
    .save()
    .then((user) => {
      ResetToken.findOneAndDelete({ userId: user.id }).then(() => {
        const mailOptions = passwordSetTemplate(user);
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res
              .status(500)
              .json({ message: "Error sending email", error });
          } else {
            return res.status(200).json({
              message: `${user.first_name} ${user.last_name} your password has been resetted sucessfully`,
            });
          }
        });
      });
    })
    .catch((e) => {
      return res
        .status(500)
        .json({ message: "Couldn't Reset password", error: e });
    });
};

const editProfile = async (req, res) => {
  console.log(req.userId);
  // const {uid} = req.query
  const errors = validationResult(req);
  // const userId = req.params.id.replace(/\s+/g, " ").trim();
  // await User.findById
  if (!errors.isEmpty()) {
    const message = errors.errors[0].msg;
    return res.status(500).json({ message: message });
  }
  const { first_name, last_name, email, phone_number, organization, dob } =
    req.body;

  let editedUser;
  try {
    editedUser = await User.findByIdAndUpdate(
      req.userData.userId,
      {
        $set: {
          first_name,
          last_name,
          email,
          phone_number,
          company: organization,
          dob,
        },
      },
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

  return res
    .status(201)
    .json({ message: " Your profile has been sucessfully edited" });
};

const fileUpload = async (req, res) => {
  if (req.fileValidationError) {
    return res.status(422).json({ message: req.fileValidationError });
  }
  if (!req.files || req.files.length <= 0)
    return res.status(422).json({ message: "No Image Provided" });

  let user;
  const files = req.files;
  // console.log(files)
  // const { uid } = req.params;

  if (!isValidObjectId(req.userData.userId))
    return res.status(404).json({ message: "Invalid Request" });
  user = await User.findById(req.userData.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  try {
    const promises = files.map(async (file) => {
      const resourceL = FileUpload({
        userId: req.userData.userId,
        name: file.originalname,
        type: file.mimetype,
        path: file.path,
      });
      let resource = await resourceL.save();
      user.resource_library.push(resource);
      // user.save()

      // return resourceL
      // .save()
      // .then((resource) => {
      //   user.resource_library.push(resource);
      //   user.save()
      // })
    });
    await Promise.all(promises);
    user.save();
    return res
      .status(200)
      .json({ message: "Files has been sucessfully uploaded" });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Error uploading resource", err: e });
  }

  // const resourceL = FileUpload({
  //   userId: user._id,
  //   name: file.originalname,
  //   type: file.mimetype,
  //   path: file.path,
  // });

  // resourceL
  //   .save()
  //   .then((resource) => {
  //     user.resource_library.push(resource);
  //     user.save().then(() => {
  //       return res.status(200).json({ message: "Resource sucessfully upload" });
  //     });
  //   })
  //   .catch((e) => {
  //     return res
  //       .status(500)
  //       .json({ message: "Error uploading resource", err: e });
  //   });
};

const getFiles = (req, res) => {
  // const { uid } = req.params;

  if (!isValidObjectId(req.userData.userId))
    return res.status(404).json({ message: "Invalid Request" });

  User.findById(req.userData.userId, " first_name last_name resource_library")
    .populate({ path: "resource_library", select: "name path" })

    .then((user) => {
      if (!user) return res.status(400).json({ message: "No User Found" });

      return res.status(200).json(user);
    })
    .catch((e) => {
      return res
        .status(500)
        .json({ message: "Something went wrong, Please try again", err: e });
    });
};

const fileDownload = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(422).json({ message: "Resource does not exist" });

  if (!isValidObjectId(id))
    return res.status(404).json({ message: "Invalid Request" });
  try {
    const file = await FileUpload.findById(id);
    if (file.userId.toString() !== req.userData.userId) {
      return res
        .status(401)
        .json({ message: "You are not allowed for this operation!" });
    }
    const string = path.join(__dirname, "..", file.path);
    if (!Fs.existsSync(string)) {
      return res.status(422).json({ message: "Invalid Path" });
    }
    res.set({
      "Content-Type": file.type,
    });

    

    res.sendFile(path.join(__dirname, "..", file.path));
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error while downloading file, Please try again" });
  }
};

const upload = (req, res) => {
  res.json({ message: "hi" });
};

const getUpload = (req, res) => {
  const cursor = bucket.find({});
  cursor.forEach((doc) => console.log(doc));
};

module.exports = {
  signup,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  editProfile,
  resendLink,
  fileUpload,
  getFiles,
  fileDownload,
  upload,
  getUpload,
};
