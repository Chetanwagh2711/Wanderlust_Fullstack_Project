const express=require("express");
const router=express.Router();
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn ,isOwner,validateListing }=require("../middleware.js");
const listingController=require("../controller/listings.js");
const multer=require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer({storage})



router.route("/")
    .get( wrapAsync(listingController.index))
    .post( 
        isLoggedIn, 
        
        upload.single("listing[image][url]"),
        validateListing, 
    wrapAsync(listingController.createlisting));
    
// new route
router.get("/new" ,isLoggedIn , wrapAsync(listingController.renderNewForm));

router.route("/:id")
.get( wrapAsync(listingController.showListing))
.put( isLoggedIn, isOwner,
    upload.single("listing[image][url]"),
 validateListing, 
    wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));


// Edit route
router.get("/:id/edit" , isLoggedIn , isOwner , 
    wrapAsync(listingController.editListing));


module.exports=router;
