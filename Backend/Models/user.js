const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    aadhaarNumber: {
        type: String,
        required: true,
        unique: true,
        match: /^[0-9]{12}$/  // Aadhaar must be 12 digits
    },
    mobileNumber: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/   // 10-digit mobile
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true,
        match: /^[0-9]{6}$/   // Indian PIN Code
    },
    district: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    dob: {
        type: String,  // If you want Date type, change to Date
        required: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true
    },
    photo: {
        type: String,   // Could be URL or emoji
        default: "👤"
    }, complaints: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Complaint"
        }
    ]

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

const sampleUsers = [
    {
        fullName: "RAJESH KUMAR SHARMA",
        aadhaarNumber: "123456789012",
        mobileNumber: "9876543210",
        email: "rajesh.sharma@example.com",
        address: "House No. 123, Sector 15, Noida, Uttar Pradesh",
        pincode: "201301",
        district: "Gautam Buddha Nagar",
        state: "Uttar Pradesh",
        dob: "1985-08-15",
        gender: "Male",
        photo: "👨"
    },
    {
        fullName: "PRIYA VERMA",
        aadhaarNumber: "234567890123",
        mobileNumber: "9123456780",
        email: "priya.verma@example.com",
        address: "Flat No. 45, Green Park, New Delhi",
        pincode: "110016",
        district: "New Delhi",
        state: "Delhi",
        dob: "1992-04-10",
        gender: "Female",
        photo: "👩"
    },
    {
        fullName: "AMIT SINGH",
        aadhaarNumber: "345678901234",
        mobileNumber: "9988776655",
        email: "amit.singh@example.com",
        address: "Plot 88, Kothrud, Pune, Maharashtra",
        pincode: "411038",
        district: "Pune",
        state: "Maharashtra",
        dob: "1990-12-02",
        gender: "Male",
        photo: "👨"
    },
    {
        fullName: "SNEHA DESAI",
        aadhaarNumber: "456789012345",
        mobileNumber: "9090909090",
        email: "sneha.desai@example.com",
        address: "Bungalow 12, Vastrapur, Ahmedabad, Gujarat",
        pincode: "380015",
        district: "Ahmedabad",
        state: "Gujarat",
        dob: "1995-07-20",
        gender: "Female",
        photo: "👩"
    },
    {
        fullName: "ARUN NAIR",
        aadhaarNumber: "567890123456",
        mobileNumber: "9812345678",
        email: "arun.nair@example.com",
        address: "House 45, Kochi, Kerala",
        pincode: "682001",
        district: "Ernakulam",
        state: "Kerala",
        dob: "1988-03-05",
        gender: "Male",
        photo: "👨"
    },
    {
        fullName: "MEENA REDDY",
        aadhaarNumber: "678901234567",
        mobileNumber: "9123098765",
        email: "meena.reddy@example.com",
        address: "H.No. 55, Banjara Hills, Hyderabad",
        pincode: "500034",
        district: "Hyderabad",
        state: "Telangana",
        dob: "1993-11-11",
        gender: "Female",
        photo: "👩"
    },
    {
        fullName: "VIJAY KUMAR",
        aadhaarNumber: "789012345678",
        mobileNumber: "9638527410",
        email: "vijay.kumar@example.com",
        address: "Sector 22, Chandigarh",
        pincode: "160022",
        district: "Chandigarh",
        state: "Chandigarh",
        dob: "1986-06-17",
        gender: "Male",
        photo: "👨"
    },
    {
        fullName: "ALISHA KHAN",
        aadhaarNumber: "890123456789",
        mobileNumber: "9876501234",
        email: "alisha.khan@example.com",
        address: "Civil Lines, Jaipur, Rajasthan",
        pincode: "302006",
        district: "Jaipur",
        state: "Rajasthan",
        dob: "1994-01-09",
        gender: "Female",
        photo: "👩"
    },
    {
        fullName: "ROHAN PATEL",
        aadhaarNumber: "901234567890",
        mobileNumber: "9012345678",
        email: "rohan.patel@example.com",
        address: "Ellis Bridge, Ahmedabad, Gujarat",
        pincode: "380006",
        district: "Ahmedabad",
        state: "Gujarat",
        dob: "1991-09-28",
        gender: "Male",
        photo: "👨"
    },
    {
        fullName: "KAVITA SHARMA",
        aadhaarNumber: "112233445566",
        mobileNumber: "8585858585",
        email: "kavita.sharma@example.com",
        address: "Model Town, Ludhiana, Punjab",
        pincode: "141002",
        district: "Ludhiana",
        state: "Punjab",
        dob: "1996-05-14",
        gender: "Female",
        photo: "👩"
    }
];

const addData = async () => {
    try {
        await User.deleteMany({});
        console.log("Old users deleted.");

        await User.insertMany(sampleUsers);
        console.log("Sample users inserted successfully!");
    } catch (err) {
        console.error("Error inserting sample data:", err);
    }
};

// addData();



module.exports = User;

