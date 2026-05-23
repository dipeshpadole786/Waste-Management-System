const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        article: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Article",
            required: true,
        },

        status: {
            type: String,
            enum: ["not_started", "in_progress", "completed"],
            default: "not_started",
        },

        progressPercent: {
            type: Number,
            default: 0, // 0–100
        },

        timeSpent: {
            type: Number, // minutes
            default: 0,
        },

        lastReadAt: {
            type: Date,
        },

        completedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Prevent duplicate progress for same user + article
userProgressSchema.index({ user: 1, article: 1 }, { unique: true });
const UserProgress = mongoose.model("UserProgress", userProgressSchema);

module.exports = UserProgress;
