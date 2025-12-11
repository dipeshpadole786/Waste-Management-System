const express = require("express");
const mongoose = require("mongoose");
const port = 3000;
const app = express();
const User = require("./Models/user");
const Article = require("./Models/Training");
const Complaint = require("./Models/Filecomplaint");
const cors = require("cors");
app.use(express.json()); // to parse JSON body


const main = async () => {
    await mongoose.connect("mongodb://localhost:27017/waste-management");
    console.log("mongodb is connected ");
};
app.use(cors({
    origin: "http://localhost:5173" // or your React dev server port
}));




main();

app.get("/", (req, res) => {
    res.send("Hello here is backend server ");

})

app.post("/aadhar", async (req, res) => {
    const { aadharnumber } = req.body; // <-- use req.body here
    console.log("Received Aadhaar:", aadharnumber);

    try {
        const user = await User.findOne({ aadhaarNumber: aadharnumber });

        if (user) {
            res.json(1); // Aadhaar exists
        } else {
            res.json(0); // Aadhaar not found
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/getUserComplaints/:aadhaar", async (req, res) => {
    try {
        const aadhaar = req.params.aadhaar;

        const user = await User.findOne({ aadhaarNumber: aadhaar })
            .populate("complaints");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Data fetched successfully",
            user,
            complaints: user.complaints
        });

    } catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.post("/filecomplaint", async (req, res) => {
    try {
        const { complaintId, complaintType, description, address, name, mobile, aadhaar } = req.body;

        // ----------------------------------------
        // 🟥 1. Validate Required Fields
        // ----------------------------------------
        if (!complaintType || !description || !address || !name || !mobile || !aadhaar) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // ----------------------------------------
        // 🟦 2. Find User By Aadhaar
        // ----------------------------------------
        const user = await User.findOne({ aadhaarNumber: aadhaar });

        if (!user) {
            return res.status(404).json({ message: "User not found with this Aadhaar" });
        }

        // ----------------------------------------
        // 🟩 3. Create Complaint
        // ----------------------------------------
        const newComplaint = await Complaint.create({
            complaintId,
            complaintType,
            description,
            address,
            name,
            mobile,
            user: user._id   // ⭐ store user reference
        });

        // ----------------------------------------
        // 🟪 4. Add Complaint ID to User
        // ----------------------------------------
        user.complaints.push(newComplaint._id);
        await user.save();

        // ----------------------------------------
        // 🟧 5. Send Response
        // ----------------------------------------
        res.status(201).json({
            message: "Complaint submitted successfully",
            complaint: newComplaint
        });

    } catch (error) {
        console.error("Error submitting complaint:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});





app.get("/userget", async (req, res) => {
    const { aadharnumber } = req.query; // read from query params

    try {
        const user = await User.findOne({ aadhaarNumber: aadharnumber });

        if (user) {
            res.json(user); // send user data
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});



app.get("/:username/:email/:phone", async (req, res) => {
    const { username, email, phone } = req.params;
    await User.insertMany({ username, email, phone });
    res.send("Succcesfull Registation");
})

app.get("/see", async (req, res) => {
    const data = await User.find();  // ✅ wait for data
    res.send(data);
})
// =======================
// GET ALL ARTICLES
// =======================
app.get("/articles", async (req, res) => {
    try {
        const articles = await Article.find().sort({ createdAt: -1 });
        res.status(200).json(articles);
    } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ message: "Server error" });
    }
});


app.listen(port, () => {
    console.log("Server is runningo on port " + port);
})
