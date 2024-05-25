const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

let mongoUrl = "mongodb://127.0.0.1:27017/wanderlust";
main()
.then((res)=>{
    console.log("DB connection successfull");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(mongoUrl);
}

const initDB = async ()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("data initialised")
};

initDB();