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

