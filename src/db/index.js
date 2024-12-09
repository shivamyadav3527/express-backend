import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


//This is asynchronous function thats why it is returning the promise;
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`DB CONNECTION ESTABLISHED !! HOST IS : ${connectionInstance.connection.host}`);
        
    } catch(error) {
        console.log("DATABASE CONNECTION FAILED", error);
        process.exit(1);
    }
}

export default connectDB