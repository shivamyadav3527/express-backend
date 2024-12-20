import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import {app} from './app.js';
dotenv.config({
    path: './env'
})

connectDB()

const PORT = process.env.PORT || 8000; // Default to 8000 if no PORT is set

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



// //1st approach
// import express from 'express';
// const app = express();
// (async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on('error', (error) => {
//             console.log("error:" , error);
//             throw error
//         })
//         app.listen(process.env.PORT, () => {
//             console.log(`app listening on port ${process.env.PORT}`)
//         })
//     } catch(error) {
//         console.error("DB not connected");
//         throw error
//     }
// })() //iffe blocks()() 