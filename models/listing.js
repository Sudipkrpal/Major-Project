const { ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listSchema = new Schema({
    title:{
        type : String,
        required : true,
    },
    description : String,
    image:{
        type : String,
        default : "https://unsplash.com/photos/coconut-tree-near-body-of-water-HfIex7qwTlI",
        set : (v) => v==="" ? "https://unsplash.com/photos/coconut-tree-near-body-of-water-HfIex7qwTlI" : v,
    },
    price : Number,
    location : String,
    country : String,
    review :[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ]
});
const Listing = mongoose.model("Listing",listSchema);
module.exports = Listing;