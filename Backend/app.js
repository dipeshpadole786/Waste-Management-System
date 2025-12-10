const express = require("express");
const mongoose = require("mongoose");
const port = 3000;
const app = express();
const User = require("./Models/user");
const main = async () => {
    await mongoose.connect("mongodb://localhost:27017/database_name");
    console.log("mongodb is connected ");
};



main();

app.get("/", (req, res) => {
    res.send("Hello here is backend server ");

})

app.get("/:username/:email/:phone", async (req, res) => {
    const { username, email, phone } = req.params;
    await User.insertMany({ username, email, phone });
    res.send("Succcesfull Registation");
})

app.get("/see", async (req, res) => {
    const data = await User.find();  // ✅ wait for data
    res.send(data);
})


app.listen(port, () => {
    console.log("Server is runningo on port " + port);
})
