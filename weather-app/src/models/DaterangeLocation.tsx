import mongoose from 'mongoose';

const daterangeLocationSchema = new mongoose.Schema(
    {
        days: [],
        lat: Number,
        lon: Number
    },
    {
        timestamps: true
    }
)

const DaterangeLocation = mongoose.models.DaterangeLocation || mongoose.model("DaterangeLocation", daterangeLocationSchema);

export default DaterangeLocation;