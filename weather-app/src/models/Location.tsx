import mongoose from 'mongoose';

const locationStruct = new mongoose.Schema({

    city: String,
    country: String,
    lat: Number,
    lon: Number,
    timestamp: { type: Date, default: Date.now }

})

