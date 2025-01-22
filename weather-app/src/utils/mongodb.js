import mongoose from "mongoose";

const connectMongoDB = async () => {

    // Check if already connected to MongoDB
    if (mongoose.connections[0].readyState) return;

    try {

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB")

    }
    catch (error) {

        console.log(error)

    }

}

export default connectMongoDB;