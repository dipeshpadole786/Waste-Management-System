const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
    {
        complaintId: {
            type: String,
            required: true,
            unique: true,
        },

        complaintType: {
            type: String,
            required: true,
            enum: [
                "Garbage Not Collected",
                "Overflowing Dustbins",
                "Vehicle Misbehavior",
                "Route Deviation",
                "Delay in Service",
                "Staff Behavior",
                "Unauthorized Dumping",
                "Other"
            ]
        },

        description: {
            type: String,
            required: true,
            maxlength: 300
        },

        address: {
            type: String,
            required: true,
        },

        name: {
            type: String,
            required: true,
        },

        mobile: {
            type: String,
            required: true,
            match: /^[0-9]{10}$/
        },

        // 👤 Complaint raised by user
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // 👷 ASSIGNED WORKER
        assignedWorker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // 📌 STATUS
        status: {
            type: String,
            enum: ["pending", "in-progress", "completed"],
            default: "pending"
        },

        // ⏱ ASSIGN TIME
        assignedAt: {
            type: Date
        },

        // 📷 Optional complaint image (stored on server filesystem; path saved in DB)
        image: {
            url: { type: String, default: null },          // e.g. /uploads/complaints/<file>
            path: { type: String, default: null },         // absolute/relative server path (for internal use)
            originalName: { type: String, default: null },
            mimeType: { type: String, default: null },
            size: { type: Number, default: null }
        }
    },
    { timestamps: true }
);

const Complaint = mongoose.model("Complaint", ComplaintSchema);
module.exports = Complaint;
