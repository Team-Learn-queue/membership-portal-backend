const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const usersRoutes = require("./routes/users-routes");
const adminRoutes = require("./routes/admin-routes");
const discussionRoutes = require("./routes/discussion");
const HttpError = require("./models/http-error");
// "multer": "1.4.4-lts.1",

const app = express();
app.use(express.json());

app.use("/uploads/files", express.static(path.join("uploads", "files")));

dotenv.config();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");

  next();
});

app.use("/api/users", usersRoutes.router);
app.use("/api/admin", adminRoutes.router);
app.use("/api/discussion", discussionRoutes.router);

app.use((req, res, next) => {
  return res
    .status(404)
    .json({ message: "Page not found.. This route couldn't be found!" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "Unknown Error" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zchdj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      maxPoolSize: 5,
    }
  )

  .then(() => {
    const server = app.listen(process.env.PORT || 8000);
    const io = require("./socket").init(server, {
      cors: {
        origin: "http://localhost:3000/",
        allowedHeaders: ["my-custom-header"],
        credentials: true,
      },

      // pingTimeout: 60000,
    });
  })
  .catch((err) => {
    console.log(err);
  });


  // const signup = async (req, res) => {
  //   const errors = validationResult(req);
  
  //   if (!errors.isEmpty()) {
  //     const message = errors.errors[0].msg;
  //     return res.status(400).json({ message: message });
  //   }
  //   let first_name = req.body.name.split(" ")[0];
  //   const last_name = req.body.name.split(" ")[1];
  //   const {
  //     email,
  //     phone_number,
  //     password,
  //     company,
  //     license_status,
  //     regulator,
  //     sector,
  //     dob,
  //   } = req.body;
  //   let existingUser;
  //   try {
  //     existingUser = await User.findOne({ email: email });
  //   } catch (err) {
  //     return res.status(500).json({ message: " Signing Up Failed" });
  //   }
  
  //   if (existingUser) {
  //     return res.status(422).json({ message: "User Already Exist" });
  //   }
    // let hashedPassword;
    // try {
    //   hashedPassword = await bcrypt.hash(password, 12);
    // } catch (err) {
    //   return res
    //     .status(422)
    //     .json({ message: "Couldn't create User, Please Try Again", e: err });
  //   // }
  //   let confirmStatus;
  //   license_status === "Unlicensed"
  //     ? (confirmStatus = null)
  //     : (confirmStatus = regulator);
  
  //   const user = User({
  //     first_name,
  //     last_name,
  //     email,
  //     phone_number,
  //     password,
  //     company,
  //     license_status,
  //     regulator: confirmStatus,
  //     sector,
  //     dob,
  //   });
  
  //   user
  //     .save()
  //     .then((user) => {
  //       const randomBytes = crypto.randomBytes(16).toString("hex");
  
  //       const token = VerificationToken({
  //         userId: user._id,
  //         token: randomBytes,
  //       });
  
  //       token.save().then(() => {
  //         const emailLink = `http://localhost:3000/email-verification?email=${user.email}&token=${randomBytes}`;
  //         const mailOptions = verifyEmailTemplate(user, emailLink);
  
  //         transporter.sendMail(mailOptions, (error, info) => {
  //           if (error) { 
  //             return res
  //               .status(500)
  //               .json({ message: "Error sending email", error });
  //           } else {
  //             return res.status(201).json({
  //               message: `${user.first_name} ${user.last_name} a confirmation email has been sent to ${user.email}`,
  //             });
  //           }
  //         });
  //       });
  //     })
  //     .catch((e) => {
  //       return res
  //         .status(500)
  //         .json({ message: "Couldn't create User, Please Try Again", 
          
  //         error: e });
  //     });
  // };
  
  // "multer": "1.4.4-lts.1",
