import express from "express"
import dotenv from "dotenv"

// kết nối với mongoDB
import {connectDB} from "./libs/db.js"

// middleware
import {protectedRoute} from "./middlewares/authMiddleware.js"

//router
import authRoute from "./routes/authRoute.js"
import userRoute from "./routes/userRoute.js"
import friendRoute from "./routes/friendRoute.js"
import messageRoute from "./routes/messageRoute.js"
import conversationRoute from "./routes/conversationRoute.js"

// thư viện để đọc được cookie
import cookieParser from "cookie-parser"

// cors
import cors from "cors"

// socket
import {app, server} from "./socket/index.js"

// cloudinary
import { v2 as cloudinary } from 'cloudinary';

// để load các biến môi trường
dotenv.config()

// const app = express()
const PORT = process.env.PORT || 5000;

// middlewares
// giúp express hiểu và đọc được body dưới dạng JSON
app.use(express.json())
app.use(cookieParser())
app.use(cors({origin: process.env.CLIENT_URL, credentials: true}))

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


//public routes
app.use("/api/auth", authRoute)


//private routes
app.use(protectedRoute) // mọi dùng ở dưới middleware này điều chạy middleware trước rồi mới vô logic chính của chúng
app.use("/api/users", userRoute)
app.use("/api/friends", friendRoute)
app.use("/api/messages", messageRoute)
app.use("/api/conversations", conversationRoute)


// connectDB chạy xong mới chạy app.listen
connectDB().then(() => {
    //cho server chạy
    server.listen(PORT, () => {
        console.log(`server đang chạy trên cổng ${PORT}`)
    })
})
