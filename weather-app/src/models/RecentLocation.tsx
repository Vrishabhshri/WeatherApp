import mongoose from 'mongoose';

const recentLocationSchema = new mongoose.Schema(
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

const RecentLocation = mongoose.models.RecentLocation || mongoose.model("RecentLocation", recentLocationSchema);

export default RecentLocation;