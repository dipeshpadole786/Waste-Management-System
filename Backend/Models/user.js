const { default: mongoose } = require("mongoose");

const userSchema = mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: Number,
    }
})

const User =  mongoose.model("User", userSchema);

module.exports = User;