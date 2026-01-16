import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        mongoose.connection.on("connected", () => console.log("Database connected successfully"));
        await mongoose.connect(`${process.env.MONGO_DB_URI}/chat-app`)
    }
    catch (error){
        console.error("Database connection error:", error);
    }
}