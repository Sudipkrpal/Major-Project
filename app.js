const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

let mongoUrl = "mongodb://127.0.0.1:27017/wanderlust";
main()
  .then((res) => {
    console.log("DB connection successfull");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoUrl);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.send("working");
});

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
// index route
app.get("/listings", async (req, res) => {
  try {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  } catch (err) {
    next(err);
  }
});

// new route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});
// show route
app.get("/listings/:id", async (req, res, next) => {
  try {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("review");
    res.render("listings/show.ejs", { listing });
  } catch (err) {
    next(err);
  }
});

// create route
app.post("/listings", async (req, res, next) => {
  try {
    let result = listingSchema.validate(req.body); //validation for schema using joi api
    console.log(result);
    if (result.error) {
      throw new ExpressError(400, result.error);
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
});

// edit route
app.get("/listings/:id/edit", async (req, res, next) => {
  try {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  } catch (err) {
    next(err);
  }
});

// update route
app.put("/listings/:id", async (req, res, next) => {
  try {
    if (!req.body.listing) {
      throw new ExpressError(400, "Send valid data for listing");
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }); //deconstructing req.body to update data
    res.redirect(`/listings/${id}`); // it will redirect to show.ejs/id
  } catch (err) {
    next(err);
  }
});

// delete route
app.delete("/listings/:id", async (req, res, next) => {
  try {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
});

// review
//post route
app.post("/listings/:id/reviews", validateReview, async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.review.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    next(err);
  }
});

//delete review route
app.delete("/listings/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
});
/* app.get("/testlisting",async(req,res)=>{
    let sampleLsting = new Listing({
        title : "New destination",
        description : "Beach side",
        price : 1200,
        location : "Goa",
        country : "India"
    });
    await sampleLsting.save();
    console.log("sample data saved");
    res.send("successfull testing");
}); */
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});
app.use((err, req, res, next) => {
  // error handling middleware
  let { statusCode = 500, message = "something went wrong" } = err;
  res.status(statusCode).render("listings/error.ejs", { message }); // to sent error.ejs template
  //res.status(statusCode).send(message);
});
app.listen(8080, () => {
  console.log("listening to port 8080");
});
