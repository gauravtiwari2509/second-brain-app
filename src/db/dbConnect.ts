import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`\n MongoDB connected !! DB host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB error: ", error);
        process.exit(1);
    }
}

export default dbConnect