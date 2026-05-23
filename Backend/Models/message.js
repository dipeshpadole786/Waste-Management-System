const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    sender: {
        type: String,
        default: "Admin"
    },

    title: {
        type: String,
        required: true
    },

    body: {
        type: String,
        required: true
    },

    messageType: {
        type: String,
        enum: ["congratulations", "encouragement", "certificate", "reminder"],
        required: true
    },

    relatedArticle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article"
    },

    isRead: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
