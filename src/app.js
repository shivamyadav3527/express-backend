import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"})) //for getting the data coming in the url
app.use(express.static("public"))
app.use(cookieParser())

import userRoutes from "./routes/user.routes.js"

app.use("/api/v1/users", userRoutes)
app.get('/set-cookie', (req, res) => {
    res.cookie('user', 'JohnDoe', { httpOnly: true }); // Set a cookie named 'user'
    res.send('Cookie has been set!');
  });
  


export { app }