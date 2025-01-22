import mongoose from 'mongoose';

const savedLocationSchema = new mongoose.Schema(
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

const SavedLocation = mongoose.models.SavedLocation || mongoose.model("SavedLocation", savedLocationSchema);

export default SavedLocation;