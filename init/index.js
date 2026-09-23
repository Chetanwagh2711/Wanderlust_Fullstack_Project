require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
console.log("Map token loaded:", !!mapToken);

const geocodingClient = mbxGeocoding({
    accessToken: mapToken
});

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
    console.log("connected to db");
}

const initDB = async () => {

    await Listing.deleteMany({});

    const listings = [];

    for (let obj of initData.data) {

        const response = await geocodingClient
            .forwardGeocode({
                query: obj.location,
                limit: 1
            })
            .send();

        if (!response.body.features.length) {
            console.log("Location not found:", obj.location);
            continue;
        }

        obj.geometry = response.body.features[0].geometry;

        obj.owner = "6aad2c29d7bc644aec90599e";

        listings.push(obj);
    }

    await Listing.insertMany(listings);

    console.log("data was initialized");
};

main()
    .then(() => {
        initDB();
    })
    .catch((err) => {
        console.log(err);
    });