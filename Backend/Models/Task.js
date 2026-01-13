const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
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
        }, user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }

    },
    { timestamps: true }
);

const Task = mongoose.model("Task", TaskSchema);
module.exports = Task;
