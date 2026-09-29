const Listing=require("../models/listing.js")
const { listingSchema } = require("../schema.js");
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient=mbxGeocoding({accessToken:mapToken});
const ExpressError = require("../utils/ExpressError.js");


module.exports.index=async(req, res)=>{
    const allListings= await Listing.find({});
    res.render("./listings/index.ejs" ,{allListings});
}

module.exports.renderNewForm=async(req, res) =>{
    res.render("./listings/new.ejs")
};

module.exports.createlisting = async (req, res, next) => {
    console.log("CREATE LISTING CONTROLLER REACHED");

    if (!req.body.listing) {
        throw new ExpressError(400, "Send Valid Data For Listing");
    }

    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send();

    console.log("MAPBOX RESPONSE RECEIVED");
    console.log(response.body.features);

    let result = listingSchema.validate(req.body);
    console.log(result);

    if (result.error) {
        throw new ExpressError(400, result.error);
    }

    if (!req.file) {
        throw new ExpressError(400, "Please upload an image");
    }

    let url = req.file.path;
    let filename = req.file.filename;

    if (!response.body.features.length) {
        throw new ExpressError(400, "Location could not be found");
    }

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    newListing.image = {
        url: url,
        filename: filename
    };

    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();

    console.log(savedListing);

    req.flash("sucess", "New Listing Created");

    res.redirect("/listings");
};

module.exports.showListing=async(req, res) =>{
    let {id}=req.params;
    const listing=await Listing.findById(id)
    .populate({path:"reviews",populate:{
        path:"author"
    },
})
    
    .populate("owner");
    if(!listing){
        req.flash("error" ,"Listing you requested does not exist!");
         return res.redirect("/listings");
    }
     res.render("listings/show.ejs", { listing });
   
};

module.exports.editListing=async(req, res)=>{
     let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error" ,"Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
     originalImageUrl=originalImageUrl.replace("/upload", "/upload/w_250");
        res.render("listings/edit.ejs", { listing ,originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true }
    );

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;

        listing.image = {
            url: url,
            filename: filename
        };

        await listing.save();
    }

    req.flash("sucess", "Listing Updated");
    res.redirect(`/listings/${id}`);
};
module.exports.deleteListing=async(req , res)=>{
    let {id}=req.params;
    let deletedListing =await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("sucess"," Listing Deleted");

    res.redirect("/listings");
}