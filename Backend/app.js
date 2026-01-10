const express = require("express");
const mongoose = require("mongoose");
const port = 3000;
const app = express();
const User = require("./Models/user");
const Article = require("./Models/Training");
const Complaint = require("./Models/Filecomplaint");
const cors = require("cors");
const UserProgress = require("./Models/UserProgress");
const DustBin = require("./Models/dustbin_location");
const Message = require("./Models/message");
app.use(express.json()); // to parse JSON body


const main = async () => {
    await mongoose.connect("mongodb://localhost:27017/waste-management");
    console.log("mongodb is connected ");
};
app.use(cors({
    origin: "http://localhost:5173" // or your React dev server port
}));







// =======================
// MONITOR PANEL ROUTES
// =======================

// 1. GET ALL USERS (for monitor panel)
app.get("/monitor/users", async (req, res) => {
    try {
        const users = await User.find()
            .select("fullName aadhaarNumber mobileNumber email address state district gender dob createdAt")
            .populate("complaints", "complaintType description status createdAt")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// GET user progress
app.get("/users/progress", async (req, res) => {
    try {
        const progress = await UserProgress.find()
            .populate("user", "fullName mobileNumber")
            .populate("article", "title")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// 2. GET ALL COMPLAINTS
app.get("/monitor/complaints", async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate("user", "fullName aadhaarNumber mobileNumber")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: complaints.length,
            complaints
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// 3. GET DASHBOARD STATISTICS
app.get("/monitor/stats", async (req, res) => {
    try {
        // Total users
        const totalUsers = await User.countDocuments();

        // New users today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newUsersToday = await User.countDocuments({
            createdAt: { $gte: today }
        });

        // Total complaints
        const totalComplaints = await Complaint.countDocuments();

        // Complaints by type
        const complaintsByType = await Complaint.aggregate([
            { $group: { _id: "$complaintType", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Users by state
        const usersByState = await User.aggregate([
            { $group: { _id: "$state", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Recent activities
        const recentComplaints = await Complaint.find()
            .populate("user", "fullName")
            .sort({ createdAt: -1 })
            .limit(5);

        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5);

        // User progress stats
        const totalProgress = await UserProgress.countDocuments();
        const completedProgress = await UserProgress.countDocuments({ status: "completed" });
        const inProgress = await UserProgress.countDocuments({ status: "in_progress" });

        res.json({
            success: true,
            stats: {
                totalUsers,
                newUsersToday,
                totalComplaints,
                complaintsByType,
                usersByState,
                totalProgress,
                completedProgress,
                inProgress
            },
            recent: {
                complaints: recentComplaints,
                users: recentUsers
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// 4. GET USER ACTIVITY LOG
app.get("/monitor/activities", async (req, res) => {
    try {
        const activities = [];

        // Get recent complaints
        const recentComplaints = await Complaint.find()
            .populate("user", "fullName")
            .sort({ createdAt: -1 })
            .limit(10);

        recentComplaints.forEach(complaint => {
            activities.push({
                id: complaint._id,
                type: "complaint",
                user: complaint.user?.fullName || "Unknown",
                action: `Filed complaint: ${complaint.complaintType}`,
                description: complaint.description.substring(0, 50) + "...",
                time: complaint.createdAt,
                icon: "📋"
            });
        });

        // Get recent user registrations
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(10);

        recentUsers.forEach(user => {
            activities.push({
                id: user._id,
                type: "registration",
                user: user.fullName,
                action: "Registered new account",
                description: `From ${user.state}, ${user.district}`,
                time: user.createdAt,
                icon: "👤"
            });
        });

        // Get recent article progress
        const recentProgress = await UserProgress.find({ status: "completed" })
            .populate("user", "fullName")
            .populate("article", "title")
            .sort({ completedAt: -1 })
            .limit(10);

        recentProgress.forEach(progress => {
            activities.push({
                id: progress._id,
                type: "learning",
                user: progress.user?.fullName || "Unknown",
                action: `Completed training: ${progress.article?.title || "Unknown"}`,
                description: "Completed 100% of the article",
                time: progress.completedAt,
                icon: "📚"
            });
        });

        // Sort all activities by time
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        // Get only top 20
        const topActivities = activities.slice(0, 20);

        res.json({
            success: true,
            count: topActivities.length,
            activities: topActivities
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// 5. GET COMPLAINT STATISTICS
app.get("/monitor/complaint-stats", async (req, res) => {
    try {
        // Complaints by status (you need to add status field to Complaint model)
        const complaintsByStatus = await Complaint.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Complaints by day (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const complaintsByDay = await Complaint.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top complainers
        const topComplainers = await Complaint.aggregate([
            {
                $group: {
                    _id: "$user",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $project: {
                    userName: "$userDetails.fullName",
                    aadhaar: "$userDetails.aadhaarNumber",
                    complaintCount: "$count"
                }
            }
        ]);

        res.json({
            success: true,
            complaintsByStatus,
            complaintsByDay,
            topComplainers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// 6. GET USER PROGRESS STATS
app.get("/monitor/progress-stats", async (req, res) => {
    try {
        // Total progress entries
        const totalProgress = await UserProgress.countDocuments();

        // Progress by status
        const progressByStatus = await UserProgress.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Top articles by completion
        const topArticles = await UserProgress.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: "$article",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "articles",
                    localField: "_id",
                    foreignField: "_id",
                    as: "articleDetails"
                }
            },
            { $unwind: "$articleDetails" },
            {
                $project: {
                    articleTitle: "$articleDetails.title",
                    completionCount: "$count"
                }
            }
        ]);

        // Average time spent
        const avgTimeSpent = await UserProgress.aggregate([
            { $match: { timeSpent: { $gt: 0 } } },
            {
                $group: {
                    _id: null,
                    avgTime: { $avg: "$timeSpent" }
                }
            }
        ]);

        res.json({
            success: true,
            totalProgress,
            progressByStatus,
            topArticles,
            avgTimeSpent: avgTimeSpent[0]?.avgTime || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// 7. SEARCH USERS
app.get("/monitor/search/users", async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Search query required" });
        }

        const users = await User.find({
            $or: [
                { fullName: { $regex: query, $options: 'i' } },
                { aadhaarNumber: { $regex: query, $options: 'i' } },
                { mobileNumber: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).limit(20);

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// 8. GET USER DETAILS WITH ALL INFO
app.get("/monitor/user/:aadhaar", async (req, res) => {
    try {
        const { aadhaar } = req.params;

        const user = await User.findOne({ aadhaarNumber: aadhaar })
            .populate({
                path: 'complaints',
                options: { sort: { createdAt: -1 } }
            });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Get user progress
        const progress = await UserProgress.find({ user: user._id })
            .populate("article", "title category level");

        res.json({
            success: true,
            user,
            progress,
            totalComplaints: user.complaints.length,
            totalProgress: progress.length,
            completedProgress: progress.filter(p => p.status === "completed").length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/c_data", async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate("user", "fullName mobileNumber email address district state pincode")
            .sort({ createdAt: -1 });

        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ message: "Error fetching complaints" });
    }
});

app.get("/auth/me", async (req, res) => {
    try {
        const { userId } = req.query;

        const user = await User.findById(userId).select("role fullName email");

        if (!user) {
            return res.status(404).json({ success: false });
        }

        res.json({
            success: true,
            user
        });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});






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

// =======================
// UPDATE USER PROGRESS
// =======================
app.post("/progress/update", async (req, res) => {
    try {
        const {
            aadhaar,
            articleId,
            status,
            progressPercent,
            timeSpent,
        } = req.body;

        if (!aadhaar || !articleId) {
            return res.status(400).json({ message: "Missing data" });
        }

        const user = await User.findOne({ aadhaarNumber: aadhaar });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let progress = await UserProgress.findOne({
            user: user._id,
            article: articleId,
        });

        if (!progress) {
            progress = new UserProgress({
                user: user._id,
                article: articleId,
                status: "not_started",
                progressPercent: 0,
                timeSpent: 0
            });
        }

        // Update fields if provided
        if (status) progress.status = status;
        if (progressPercent !== undefined)
            progress.progressPercent = Math.min(100, Math.max(0, progressPercent)); // Clamp between 0-100

        if (timeSpent) progress.timeSpent += timeSpent;

        progress.lastReadAt = new Date();

        // If status is completed, set completion details
        if (status === "completed") {
            progress.completedAt = new Date();
            progress.progressPercent = 100;
        }
        // If progress reaches 100%, mark as completed
        else if (progress.progressPercent >= 100) {
            progress.status = "completed";
            progress.completedAt = new Date();
        }
        // If progress is > 0 but not completed, mark as in_progress
        else if (progress.progressPercent > 0 && progress.progressPercent < 100) {
            progress.status = "in_progress";
        }

        await progress.save();

        res.status(200).json({
            message: "Progress updated",
            progress,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get all progress for a user
app.get("/progress/user/:aadhaar", async (req, res) => {
    try {
        const { aadhaar } = req.params;

        const user = await User.findOne({ aadhaarNumber: aadhaar });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const progress = await UserProgress.find({ user: user._id })
            .populate("article", "title category readTime level");

        res.status(200).json(progress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
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


// =======================
// GET USER PROFILE
// =======================
app.get("/user/profile/:aadhaarNumber", async (req, res) => {
    try {
        const { aadhaarNumber } = req.params;

        console.log("Aadhaar received:", aadhaarNumber); // 👈 ADD THIS

        const user = await User.findOne({ aadhaarNumber })
            .select("-__v -createdAt -updatedAt")
            .populate("complaints");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});

// =======================
// SERVER START
// =======================




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

app.post("/articles", async (req, res) => {
    try {
        const {
            title,
            category,
            level,
            readTime,
            posterColor,
            icon,
            summary,
            fullContent
        } = req.body;

        const article = new Article({
            title,
            category,
            level,
            readTime,
            posterColor,
            icon,
            summary,
            fullContent
        });

        await article.save();

        res.status(201).json({ success: true, article });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get("/articles/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Article ID:", id);

        const article = await Article.findById(id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: "Article not found"
            });
        }

        res.status(200).json({
            success: true,
            data: article
        });
    } catch (error) {
        console.error("Error fetching article:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
app.put("/articles/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const updatedArticle = await Article.findByIdAndUpdate(
            id,
            {
                title: req.body.title,
                category: req.body.category,
                level: req.body.level,
                readTime: req.body.readTime,
                posterColor: req.body.posterColor,
                icon: req.body.icon,
                summary: req.body.summary,
                fullContent: req.body.fullContent,
            },
            { new: true } // return updated document
        );

        if (!updatedArticle) {
            return res.status(404).json({
                success: false,
                message: "Article not found"
            });
        }

        res.status(200).json({
            success: true,
            updatedArticle
        });

    } catch (error) {
        console.error("Error updating article:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update article"
        });
    }
});

app.delete("/articles/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const deletedArticle = await Article.findByIdAndDelete(id);

        if (!deletedArticle) {
            return res.status(404).json({
                success: false,
                message: "Article not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Article deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting article:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete article"
        });
    }
});

app.get("/dustbins", async (req, res) => {
    try {
        const dustbins = await DustBin.find();
        res.status(200).json(dustbins);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch dustbins" });
    }
});

app.post("/messages/send", async (req, res) => {
    try {
        const {
            receiver,
            title,
            body,
            messageType,
            relatedArticle
        } = req.body;

        if (!receiver || !title || !body || !messageType) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const message = await Message.create({
            receiver,
            title,
            body,
            messageType,
            relatedArticle
        });

        // Optional: attach message to user
        await User.findByIdAndUpdate(receiver, {
            $push: { messages: message._id }
        });

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: message
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/ma/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id)
            .populate({
                path: "messages",
                options: { sort: { createdAt: -1 } } // latest first
            });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            data: user.messages
        });

    } catch (error) {
        console.error("Populate messages error:", error);
        res.status(500).json({ message: "Server error" });
    }
});



app.listen(port, () => {
    console.log("Server is runningo on port " + port);
})
