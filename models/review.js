const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    comment : String,
    rating : {
        type:Number,
        max:5,
        min:1
    },
    createdAt : {
        type:Date,
        default:Date.now()
    },
})
module.exports = mongoose.model("Review",ReviewSchema);