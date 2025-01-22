import mongoose from 'mongoose';

const daterangeLocationSchema = new mongoose.Schema(
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

const DateRangeLocation = mongoose.models.DateRangeLocation || mongoose.model("DateRangeLocation", daterangeLocationSchema);

export default DateRangeLocation;