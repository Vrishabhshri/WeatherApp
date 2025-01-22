import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
    {
        city: String,
        country: String,
        lat: Number,
        lon: Number
    },
    {
        timestamps: true
    }
)

const Location = mongoose.models.Location || mongoose.model("Location", locationSchema);

export default Location;