// ../schema.js

const Joi = require("joi");
const mongoose = require("mongoose");

// Define the Mongoose schema for "Review"
const reviewSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    rating: { type: Number, min: 0, max: 5, required: true },
    createdAt: { type: Date, default: Date.now },
    // Add other fields as needed
});

// Register the "Review" model with Mongoose
const Review = mongoose.model("Review", reviewSchema);

// Define the Joi schema for validating listings
const listingSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string(),
    image: Joi.string().uri(),
    price: Joi.number().min(0).required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    // Add other fields as needed
});

module.exports = { listingSchema, Review };