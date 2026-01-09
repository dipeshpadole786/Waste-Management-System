const mongoose = require("mongoose");

const Dust_add = new mongoose.Schema({
    dustbin_id: {
        type: Number,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    level: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    }
}, { timestamps: true });

const DustBin = mongoose.model("DustBin", Dust_add);

const data = [
    {
        dustbin_id: 1,
        location: "Yeshwantrao Chavan College of Engineering, Hingna Road, Wanadongri, Nagpur, Maharashtra 441110",
        level: 20
    },
    {
        dustbin_id: 2,
        location: "Opp. YCCE Bhasin's Armani Girls Hostel, Plot 88/89, Sainagar Ugale Layout, Hingna Road, Wanadongri, Nagpur, Maharashtra 441110",
        level: 35
    },
    {
        dustbin_id: 3,
        location: "Arya Girls Hostel, Plot No. 7, Matoshri Nagar, Wanadongri, Hingna Road, Nagpur, Maharashtra 441110",
        level: 45
    },
    {
        dustbin_id: 4,
        location: "Zoop Cafe, Shop No.1, Pioneer Woods, Near YCCE College, Hingna Road, Wanadongri, Nagpur, Maharashtra 441110",
        level: 30
    },
    {
        dustbin_id: 5,
        location: "Snooker World And Cafe, Opposite YCCE College, Near Green Park, Hingna Road, Wanadongri, Nagpur, Maharashtra 441110",
        level: 50
    },
    {
        dustbin_id: 6,
        location: "Hingna Road Bus Stop near YCCE College, Wanadongri, Nagpur, Maharashtra 441110",
        level: 15
    },
    {
        dustbin_id: 7,
        location: "Main Gate YCCE Campus, Hingna Road, Wanadongri, Nagpur, Maharashtra 441110",
        level: 60
    },
    {
        dustbin_id: 8,
        location: "Pioneer Apartments Entrance, Hingna Road, Near YCCE, Wanadongri, Nagpur, Maharashtra 441110",
        level: 25
    }
];

const add = async () => {
    try {
        await DustBin.deleteMany({});
        await DustBin.insertMany(data);
        console.log("✅ Dustbin data inserted successfully");
        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error inserting dustbin data:", error.message);
    }
};


// add();

module.exports = DustBin;