const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const usersRoutes = require("./routes/users-routes");
const adminRoutes = require("./routes/admin-routes");
const discussionRoutes = require("./routes/discussion");
const voteRoutes = require("./routes/vote-routes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use("/uploads/files", express.static(path.join("uploads", "files")));

dotenv.config();
let environment = process.env.NODE_ENV;
let url;
if (environment === "development") {
  url = "http://localhost:3000/";
} else {
  url = process.env.FRONTEND_URL;
}
app.use("/api/users", usersRoutes.router);
app.use("/api/admin", adminRoutes.router);
app.use("/api/discussion", discussionRoutes.router);
app.use("/api/vote", voteRoutes.router);

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
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ebjfjt7.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      maxPoolSize: 4,
    }
  )
  .then(() => {
    const server = app.listen(process.env.PORT || 8000);
    const io = require("./socket").init(server, {
      cors: { 
        origin: url,
        allowedHeaders: ["my-custom-header"],
        credentials: true,
      },

      // pingTimeout: 60000,
    });
  })
  .catch((err) => {
    console.log(err);
  });
