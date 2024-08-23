const mongoose = require("mongoose");

const db = process.env.DATABASE;

mongoose
  .connect(db)
  .then(() => {
    console.log("DB Connection Start");
  })
  .catch((error) => console.log(error));
