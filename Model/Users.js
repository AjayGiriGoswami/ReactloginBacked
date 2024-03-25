const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    number: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});



const Users = mongoose.model("users", userSchema);
module.exports = Users;
