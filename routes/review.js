const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js")
const ExpressError=require("../utils/ExpressError.js")
const {listingSchema , reviewSchema}=require("../schema.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const {validateReview ,isLoggedIn, isReviewAuthor}=require("../middleware.js");
const reviewController=require("../controller/reviews.js")


// Reviews
router.post("/", isLoggedIn ,validateReview, 
    wrapAsync(reviewController.createReview));

    
// delete review Post
router.delete("/:reviewId" , isLoggedIn , isReviewAuthor ,
    wrapAsync(reviewController.deleteReview));

module.exports=router;