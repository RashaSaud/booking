require("dotenv").config();

const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://ralmatrafi:Ha6oo123@cluster0.a0y6p.mongodb.net/", {})
  .then(
    () => {
      console.log("DB connected");
    },
    (err) => {
      console.log(err);
      
    }
  );
