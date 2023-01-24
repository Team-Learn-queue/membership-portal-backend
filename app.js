const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");


const usersRoutes = require("./routes/users-routes");
const adminRoutes = require("./routes/admin-routes");

const app = express();
app.use(express.json());


dotenv.config();
app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE')
  
    next()
  })
app.use("/api/users", usersRoutes.router);
app.use("/api/admin", adminRoutes.router);




mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zchdj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
