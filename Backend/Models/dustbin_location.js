const mongoose = require("mongoose");

const Dust_add = new mongoose.Schema({
    dustbin_id: {
        type: Number,
        required: true,
        unique: true
    },
    coordinates: {
        lat: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },
        lng: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        }
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
        coordinates: { lat: 21.09499, lng: 78.98026 },
        level: 20
    },
    {
        dustbin_id: 2,
        coordinates: { lat: 21.09390, lng: 78.97750 },
        level: 35
    },
    {
        dustbin_id: 3,
        coordinates: { lat: 21.09388, lng: 78.97609 },
        level: 45
    },
    {
        dustbin_id: 4,
        coordinates: { lat: 21.09450, lng: 78.97900 },
        level: 30
    },
    {
        dustbin_id: 5,
        coordinates: { lat: 21.09550, lng: 78.97950 },
        level: 50
    },
    {
        dustbin_id: 6,
        coordinates: { lat: 21.09510, lng: 78.98100 },
        level: 15
    },
    {
        dustbin_id: 7,
        coordinates: { lat: 21.09550, lng: 78.98050 },
        level: 60
    },
    {
        dustbin_id: 8,
        coordinates: { lat: 21.09580, lng: 78.97800 },
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