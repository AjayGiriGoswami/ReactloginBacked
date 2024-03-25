const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./DB/Connection");
const router = require("./Routes/router");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);  
app.use(cookieParser());
app.use("/auth", router);

// api check
app.get("/", (req, res) => {
  res.send("Server start");
});

// server listen
app.listen(process.env.PORT, () =>
  console.log(`Server running on http://localhost:5000`)
);
